"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { Callout } from "@/components/ui/Callout";
import { CommandBlock, InlineCommandRow } from "@/components/ui/CommandBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { checkboxLabelClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { iconButtonClasses } from "@/components/ui/formClasses";
import { AttackModeId, ATTACK_MODES, ATTACK_MODES_BY_ID } from "@/lib/hashcat/attackModes";
import { buildBenchmarkCommand, buildCommand, buildShowCommand } from "@/lib/hashcat/generate";
import { HASHCAT_MODES } from "@/lib/hashcat/modes";
import { HashcatSelection, TargetKind, WorkloadProfile } from "@/lib/hashcat/params";
import { validateSelection } from "@/lib/hashcat/validation";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { SavedWordlist, useSavedWordlists } from "@/lib/storage/savedWordlists";

const HISTORY_KEY = "payloadify:hashcat-command-builder:history";
const SAVED_WORDLISTS_KEY = "payloadify:hashcat-command-builder:saved-wordlists";

// Defaults so a first-time visitor can click Generate immediately without typing anything —
// only the target hash is ever left blank, since that's the one thing this tool can't guess.
const DEFAULT_WORDLIST = "/usr/share/wordlists/rockyou.txt"; // Kali's default post-extraction path
const DEFAULT_MASK = "?u?l?l?l?l?l?d?d?d";

const MASK_CHEAT_SHEET =
  "?l = lowercase a-z\n?u = uppercase A-Z\n?d = digit 0-9\n?s = symbol (space/punctuation)\n?a = all of the above\n?b = 0x00-0xff\n\nExample: ?u?l?l?l?l?l?d?d?d matches Password123-style patterns.";

export function HashcatCommandBuilderTool() {
  // next/navigation's useSearchParams (not a manual window.location.search read) — this is the
  // part that was actually broken: on a client-side <Link> transition from the Hash Identifier,
  // window.location.search was not reliably updated yet at the moment this component's useState
  // initializers first ran, so a plain window.location read silently produced an empty handoff.
  // useSearchParams is populated by the router itself and is correct at first render.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handoffModeParam = searchParams.get("mode");
  const handoffHashParam = searchParams.get("hash");

  // A handed-off mode that's in our curated list drives the dropdown directly (so it visibly
  // shows the right entry, e.g. "1400 — SHA-256") rather than silently falling back to the
  // dropdown's own default while only the separate custom-override field holds the real value —
  // that mismatch was confusing even though the effective `mode` below was already correct.
  const handoffModeIsKnown =
    handoffModeParam != null && HASHCAT_MODES.some((m) => String(m.mode) === handoffModeParam);
  const [modeSelect, setModeSelect] = useState<string>(() =>
    handoffModeIsKnown ? handoffModeParam! : String(HASHCAT_MODES[0]?.mode ?? 0),
  );
  const [customModeText, setCustomModeText] = useState(() => (handoffModeIsKnown ? "" : (handoffModeParam ?? "")));
  const [attackMode, setAttackMode] = useState<AttackModeId>("0");
  const [targetKind, setTargetKind] = useState<TargetKind>("value");
  const [targetValue, setTargetValue] = useState(() => handoffHashParam ?? "");
  const [wordlist, setWordlist] = useState(DEFAULT_WORDLIST);
  const [wordlist2, setWordlist2] = useState(DEFAULT_WORDLIST);
  const [mask, setMask] = useState(DEFAULT_MASK);
  const [rulesText, setRulesText] = useState("");
  const [charset1, setCharset1] = useState("");
  const [charset2, setCharset2] = useState("");
  const [charset3, setCharset3] = useState("");
  const [charset4, setCharset4] = useState("");
  const [incrementEnabled, setIncrementEnabled] = useState(false);
  const [incrementMinText, setIncrementMinText] = useState("");
  const [incrementMaxText, setIncrementMaxText] = useState("");
  const [workloadText, setWorkloadText] = useState("");
  const [optimizedKernel, setOptimizedKernel] = useState(false);
  const [force, setForce] = useState(false);
  const [potfileDisable, setPotfileDisable] = useState(false);
  const [usernameMode, setUsernameMode] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [outfile, setOutfile] = useState("");
  const [outfileFormat, setOutfileFormat] = useState("");

  const [generatedSelection, setGeneratedSelection] = useState<HashcatSelection | null>(null);
  const { blockedMsg, setBlockedMsg, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  const { wordlists: savedWordlists, save: saveWordlistEntry, remove: removeWordlistEntry, removeAll: removeAllWordlists } =
    useSavedWordlists(SAVED_WORDLISTS_KEY);
  const [selectedWordlistId, setSelectedWordlistId] = useState("");
  const [saveWordlistName, setSaveWordlistName] = useState("");

  // The mode/hash values themselves are already applied via the lazy useState initializers
  // above — this effect's only job is scrubbing ?mode=&hash= from the address bar afterward, so
  // a captured hash value doesn't linger in browser history/bookmarks. Goes through the router
  // (not a raw window.history.replaceState) so Next's client-side navigation state stays in sync.
  useEffect(() => {
    if (handoffModeParam === null && handoffHashParam === null) return;
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  const mode = customModeText.trim() !== "" ? Number(customModeText.trim()) : Number(modeSelect);
  const attackModeDef = ATTACK_MODES_BY_ID[attackMode];
  const showsField = (field: "wordlist" | "wordlist2" | "mask") => attackModeDef.fields.includes(field);

  const rules = useMemo(
    () =>
      rulesText
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0),
    [rulesText],
  );

  const incrementMin = incrementMinText.trim() !== "" ? Number(incrementMinText) : null;
  const incrementMax = incrementMaxText.trim() !== "" ? Number(incrementMaxText) : null;
  const workload = workloadText !== "" ? (Number(workloadText) as WorkloadProfile) : null;

  const liveSelection: HashcatSelection = {
    mode,
    attackMode,
    target: { kind: targetKind, value: targetValue },
    wordlist,
    wordlist2,
    mask,
    rules,
    charset1,
    charset2,
    charset3,
    charset4,
    incrementEnabled,
    incrementMin,
    incrementMax,
    workload,
    optimizedKernel,
    force,
    potfileDisable,
    usernameMode,
    sessionName,
    outfile,
    outfileFormat,
  };

  const validation = validateSelection(liveSelection);
  const canGenerateNow = validation.ok;

  function loadWordlist(id: string) {
    setSelectedWordlistId(id);
    const saved = savedWordlists.find((w) => w.id === id);
    if (saved) setWordlist(saved.path);
  }

  function saveCurrentWordlist() {
    const path = wordlist.trim();
    if (path.length === 0) return;
    const label = saveWordlistName.trim() || path;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    saveWordlistEntry({ id, label, path });
    setSaveWordlistName("");
  }

  function deleteSelectedWordlist() {
    if (!selectedWordlistId) return;
    removeWordlistEntry(selectedWordlistId);
    setSelectedWordlistId("");
  }

  function deleteAllWordlists() {
    if (savedWordlists.length === 0) return;
    const confirmed = window.confirm(`Delete all ${savedWordlists.length} saved wordlists? This cannot be undone.`);
    if (!confirmed) return;
    removeAllWordlists();
    setSelectedWordlistId("");
  }

  function generate() {
    if (!canGenerateNow) return;
    const check = checkAndClear();
    if (!check.allowed) return;
    setGeneratedSelection(liveSelection);
    recordGeneration(check.now);
  }

  function resetAll() {
    setModeSelect(String(HASHCAT_MODES[0]?.mode ?? 0));
    setCustomModeText("");
    setAttackMode("0");
    setTargetKind("value");
    setTargetValue("");
    setWordlist(DEFAULT_WORDLIST);
    setWordlist2(DEFAULT_WORDLIST);
    setMask(DEFAULT_MASK);
    setRulesText("");
    setSelectedWordlistId("");
    setSaveWordlistName("");
    setCharset1("");
    setCharset2("");
    setCharset3("");
    setCharset4("");
    setIncrementEnabled(false);
    setIncrementMinText("");
    setIncrementMaxText("");
    setWorkloadText("");
    setOptimizedKernel(false);
    setForce(false);
    setPotfileDisable(false);
    setUsernameMode(false);
    setSessionName("");
    setOutfile("");
    setOutfileFormat("");
    setGeneratedSelection(null);
    setBlockedMsg(null);
  }

  const generatedCommand = useMemo(() => (generatedSelection ? buildCommand(generatedSelection) : null), [generatedSelection]);
  const generatedShowCommand = useMemo(
    () => (generatedSelection ? buildShowCommand(generatedSelection) : null),
    [generatedSelection],
  );
  const generatedBenchmarkCommand = useMemo(
    () => (generatedSelection ? buildBenchmarkCommand(generatedSelection.mode) : null),
    [generatedSelection],
  );

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Not sure what type of hash you have?{" "}
        <Link href="/hash-identifier" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
          Detect Hash →
        </Link>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Hashcat mode
            <Tooltip text="The -m value. Coming from the Hash Identifier pre-fills this automatically. Otherwise pick from common types below, or type any mode number." />
          </label>
          <select
            value={modeSelect}
            onChange={(e) => {
              setModeSelect(e.target.value);
              setCustomModeText("");
            }}
            className={`${selectClasses} w-full`}
          >
            {HASHCAT_MODES.map((m) => (
              <option key={m.mode} value={m.mode}>
                {m.mode}: {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Or custom mode number
            <Tooltip text="Overrides the dropdown above. Use this for a mode not in the list. See hashcat --help for the full mode list." />
          </label>
          <input
            type="number"
            min={0}
            value={customModeText}
            onChange={(e) => setCustomModeText(e.target.value)}
            placeholder="e.g. 11300"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Attack mode</label>
        <div className="flex flex-wrap gap-1">
          {ATTACK_MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setAttackMode(m.id)} className={toggleButtonClasses(attackMode === m.id)}>
              {m.name}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{attackModeDef.description}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Target</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <button type="button" onClick={() => setTargetKind("value")} className={toggleButtonClasses(targetKind === "value")}>
            Hash value
          </button>
          <button type="button" onClick={() => setTargetKind("file")} className={toggleButtonClasses(targetKind === "file")}>
            Hash file path
          </button>
        </div>
        <input
          type="text"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder={targetKind === "value" ? "b4b9b02e6f09a9bd760f388b67351e2b" : "hashes.txt"}
          className={inputClasses}
        />
        {targetKind === "value" && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Wrapped in single quotes in the command below. This protects hashes that start with $ (bcrypt, crypt formats) from bash
            variable expansion.
          </p>
        )}
        {targetKind === "file" && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            This tool never reads your filesystem. Enter the path you&apos;ll actually use on your own machine.
          </p>
        )}
      </div>

      {showsField("wordlist") && (
        <div>
          <label className="mb-1 block text-sm font-medium">Wordlist path</label>
          <input
            type="text"
            value={wordlist}
            onChange={(e) => setWordlist(e.target.value)}
            placeholder={DEFAULT_WORDLIST}
            className={inputClasses}
          />

          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-sm font-medium">Save this path as</label>
              <input
                type="text"
                value={saveWordlistName}
                onChange={(e) => setSaveWordlistName(e.target.value)}
                placeholder="e.g. rockyou"
                className={inputClasses}
              />
            </div>
            <button type="button" onClick={saveCurrentWordlist} disabled={wordlist.trim().length === 0} className={iconButtonClasses}>
              Save Path
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={selectedWordlistId}
              onChange={(e) => loadWordlist(e.target.value)}
              className={`${selectClasses} min-w-[220px]`}
            >
              <option value="">(Load a saved wordlist)</option>
              {savedWordlists.map((w: SavedWordlist) => (
                <option key={w.id} value={w.id}>
                  {w.label} ({w.path})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={deleteSelectedWordlist}
              disabled={!selectedWordlistId}
              className={iconButtonClasses}
            >
              Delete Selected
            </button>
            <button type="button" onClick={deleteAllWordlists} disabled={savedWordlists.length === 0} className={iconButtonClasses}>
              Delete All
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Saved wordlist paths are stored in your browser only. They won&apos;t sync across devices.
          </p>
        </div>
      )}

      {showsField("wordlist2") && (
        <div>
          <label className="mb-1 block text-sm font-medium">Wordlist 2 path</label>
          <input
            type="text"
            value={wordlist2}
            onChange={(e) => setWordlist2(e.target.value)}
            placeholder={DEFAULT_WORDLIST}
            className={inputClasses}
          />
        </div>
      )}

      {showsField("mask") && (
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Mask
            <Tooltip text={MASK_CHEAT_SHEET} />
          </label>
          <input
            type="text"
            value={mask}
            onChange={(e) => setMask(e.target.value)}
            placeholder="?u?l?l?l?l?l?d?d?d"
            className={`${inputClasses} font-mono`}
          />
        </div>
      )}

      {attackMode === "0" && (
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Rules file(s)
            <Tooltip text="One path per line; each becomes its own -r flag. Only applies to Straight/Dictionary attacks. Leave empty to skip." />
          </label>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            placeholder={"rules/best64.rule"}
            rows={2}
            className={`${inputClasses} font-mono`}
          />
        </div>
      )}

      <details className="rounded border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">+ Advanced Options</summary>
        <div className="flex flex-col gap-4 px-3 pb-3">
          {attackMode === "3" && (
            <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Custom charsets & increment
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Custom charset 1 (-1)</label>
                  <input type="text" value={charset1} onChange={(e) => setCharset1(e.target.value)} placeholder="?l?u" className={`${inputClasses} font-mono`} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Custom charset 2 (-2)</label>
                  <input type="text" value={charset2} onChange={(e) => setCharset2(e.target.value)} placeholder="?d?s" className={`${inputClasses} font-mono`} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Custom charset 3 (-3)</label>
                  <input type="text" value={charset3} onChange={(e) => setCharset3(e.target.value)} className={`${inputClasses} font-mono`} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Custom charset 4 (-4)</label>
                  <input type="text" value={charset4} onChange={(e) => setCharset4(e.target.value)} className={`${inputClasses} font-mono`} />
                </div>
              </div>
              <label className={checkboxLabelClasses}>
                <input type="checkbox" checked={incrementEnabled} onChange={(e) => setIncrementEnabled(e.target.checked)} />
                Enable mask increment (--increment)
              </label>
              {incrementEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Increment min</label>
                    <input type="number" min={0} value={incrementMinText} onChange={(e) => setIncrementMinText(e.target.value)} className={`${selectClasses} w-full`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Increment max</label>
                    <input type="number" min={0} value={incrementMaxText} onChange={(e) => setIncrementMaxText(e.target.value)} className={`${selectClasses} w-full`} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Workload profile (-w)
                <Tooltip text="1=Low, 2=Default, 3=High, 4=Nightmare. Higher can make your GPU less responsive for other tasks." />
              </label>
              <select value={workloadText} onChange={(e) => setWorkloadText(e.target.value)} className={`${selectClasses} w-full`}>
                <option value="">Default</option>
                <option value="1">1: Low</option>
                <option value="2">2: Default</option>
                <option value="3">3: High</option>
                <option value="4">4: Nightmare</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Session name (--session)</label>
              <input type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="job1" className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={optimizedKernel} onChange={(e) => setOptimizedKernel(e.target.checked)} />
              Optimized kernel (-O)
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
              --force
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={potfileDisable} onChange={(e) => setPotfileDisable(e.target.checked)} />
              --potfile-disable
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={usernameMode} onChange={(e) => setUsernameMode(e.target.checked)} />
              --username
              <Tooltip text="Enable when each line in your hash file is username:hash rather than a bare hash. Common for dumped credential files." />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Output file (-o)</label>
              <input type="text" value={outfile} onChange={(e) => setOutfile(e.target.value)} placeholder="cracked.txt" className={inputClasses} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Output format (--outfile-format)</label>
              <input
                type="text"
                value={outfileFormat}
                disabled={outfile.trim().length === 0}
                onChange={(e) => setOutfileFormat(e.target.value)}
                placeholder="2"
                className={`${inputClasses} disabled:opacity-40`}
              />
            </div>
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

      {!canGenerateNow && validation.message && targetValue.length + wordlist.length + mask.length + wordlist2.length > 0 && (
        <Callout variant="warning">{validation.message}</Callout>
      )}

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!generatedCommand && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate Command.</Callout>}

      {generatedSelection && generatedCommand && (
        <div className="flex flex-col gap-4">
          <CommandBlock label="Command" command={generatedCommand} actions={<CopyButton text={generatedCommand} label="Copy Command" />} />

          <details className="rounded border border-zinc-200 dark:border-zinc-800" open>
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Companion commands</summary>
            <div className="flex flex-col gap-3 px-3 pb-3 text-sm text-zinc-600 dark:text-zinc-400">
              <InlineCommandRow label="Check already-cracked results (no re-run)" command={generatedShowCommand ?? ""} />
              <InlineCommandRow label="Benchmark this mode on your hardware" command={generatedBenchmarkCommand ?? ""} />
              <p>
                Already-cracked hashes are looked up from hashcat&apos;s potfile (unless <code>--potfile-disable</code> is set).{" "}
                <code>--show</code> reads it without spending any GPU time.
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
