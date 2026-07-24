"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { CopyButton } from "@/components/ui/CopyButton";
import { inputClasses, primaryButtonClasses, secondaryButtonClasses, selectClasses } from "@/components/ui/formClasses";
import { SectionNav, useSectionTracking } from "@/components/ui/SectionNav";
import { StickySummaryBar } from "@/components/ui/StickySummaryBar";
import { ArchId } from "@/lib/msfvenom/archs";
import { EncoderId, MSFVENOM_ENCODERS_BY_ID, NONE_ENCODER, encodersForArch } from "@/lib/msfvenom/encoders";
import { FormatId, MSFVENOM_FORMATS_BY_ID } from "@/lib/msfvenom/formats";
import {
  MsfvenomSelection,
  buildBashVariable,
  buildCommand,
  buildListenerParamsOnly,
  hasNoEncoderRisk,
  requiresOutputFilename,
  suggestFilename,
} from "@/lib/msfvenom/generate";
import { ExitfuncId, Platform } from "@/lib/msfvenom/params";
import { MSFVENOM_CATEGORIES, MSFVENOM_PAYLOADS, MSFVENOM_PAYLOADS_BY_ID, PayloadId } from "@/lib/msfvenom/payloads";
import { MSFVENOM_TEMPLATES, MSFVENOM_TEMPLATES_BY_ID } from "@/lib/msfvenom/templates";
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
import { AdvancedOptionsPanel } from "./AdvancedOptionsPanel";
import { EvasionOptionsPanel } from "./EvasionOptionsPanel";
import { GeneratedOutputPanel } from "./GeneratedOutputPanel";
import { ListenerPanel } from "./ListenerPanel";
import { PayloadSelectionFields } from "./PayloadSelectionFields";

const HISTORY_KEY = "payloadify:msfvenom-generator:history";

const NAV_SECTIONS = [
  { id: "payload", label: "Payload" },
  { id: "evasion", label: "Evasion" },
  { id: "listener", label: "Listener" },
  { id: "advanced", label: "Advanced" },
  { id: "output", label: "Output" },
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

  const { activeId, outputVisible } = useSectionTracking(
    NAV_SECTIONS.map((s) => s.id),
    "output",
  );

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <SectionNav sections={NAV_SECTIONS} activeId={activeId} />

      <div id="payload" className="flex flex-col gap-6">
        <PayloadSelectionFields
          templateId={templateId}
          templates={MSFVENOM_TEMPLATES}
          onTemplateChange={selectTemplate}
          platformFilter={platformFilter}
          onPlatformChange={selectPlatform}
          payloadId={payloadId}
          payload={payload}
          visibleCategories={visibleCategories}
          filteredPayloads={filteredPayloads}
          onPayloadChange={selectPayload}
          archId={archId}
          onArchChange={selectArch}
          formatId={formatId}
          format={format}
          formatOptions={formatOptions}
          onFormatChange={selectFormat}
        />
      </div>

      <div id="evasion">
        <EvasionOptionsPanel
          encoderId={encoderId}
          encoder={encoder}
          encoderOptions={encoderOptions}
          onEncoderChange={selectEncoder}
          archId={archId}
          iterationsText={iterationsText}
          iterationsValid={iterationsValid}
          onIterationsChange={setIterationsTextWrapped}
          liveRisk={liveRisk}
        />
      </div>

      <div id="listener" className="flex flex-col gap-6">
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

        <ListenerPanel
          lhost={lhost}
          lportText={lportText}
          port={port}
          hostValidation={hostValidation}
          portValid={portValid}
          onLhostChange={setLhost}
          onLportTextChange={setLportText}
        />
      </div>

      <div id="advanced">
        <AdvancedOptionsPanel
          payload={payload}
          onToggleStaging={toggleStaging}
          exitfunc={exitfunc}
          onExitfuncChange={selectExitfunc}
          filename={filename}
          needsFilename={needsFilename}
          filenameValid={filenameValid}
          onFilenameChange={setFilenameWrapped}
          extraOptions={extraOptions}
          onExtraOptionsChange={setExtraOptionsWrapped}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
        <button type="button" onClick={generate} disabled={!canGenerateNow} className={primaryButtonClasses}>
          Generate Command
        </button>
        <button type="button" onClick={resetAll} className={secondaryButtonClasses}>
          Reset
        </button>
      </div>

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!generatedCommand && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate Command.</Callout>}

      <div id="output">
        {generatedSelection && generatedCommand && (
          <GeneratedOutputPanel
            generatedSelection={generatedSelection}
            generatedCommand={generatedCommand}
            generatedBashVariable={generatedBashVariable}
            generatedListenerParams={generatedListenerParams}
            generatedRisk={generatedRisk}
            guideLhost={guideLhost}
            guideLport={guideLport}
          />
        )}
      </div>

      <StickySummaryBar
        visible={!outputVisible && !!generatedCommand}
        content={<code className="truncate text-xs">{generatedCommand ?? "Not generated yet"}</code>}
        actions={generatedCommand && <CopyButton text={generatedCommand} label="Copy" />}
      />
    </div>
  );
}
