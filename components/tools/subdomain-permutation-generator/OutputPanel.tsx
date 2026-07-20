"use client";

import { useMemo } from "react";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { FilenameInput } from "@/components/ui/FilenameInput";
import { inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { useEditableFilename } from "@/lib/hooks/useEditableFilename";
import { SortMode } from "@/lib/subdomain/config";
import { applyPatternFilter } from "@/lib/subdomain/filter";
import { GenerationResult } from "@/lib/subdomain/generate";

export function OutputPanel({
  generatedResult,
  baseDomain,
  pendingFilterPattern,
  pendingFilterMode,
  onPendingFilterPatternChange,
  onPendingFilterModeChange,
  appliedFilterPattern,
  appliedFilterMode,
  onApplyFilter,
  sortMode,
  onSortModeChange,
}: {
  generatedResult: GenerationResult | null;
  baseDomain: string;
  pendingFilterPattern: string;
  pendingFilterMode: "include" | "exclude";
  onPendingFilterPatternChange: (value: string) => void;
  onPendingFilterModeChange: (mode: "include" | "exclude") => void;
  appliedFilterPattern: string;
  appliedFilterMode: "include" | "exclude";
  onApplyFilter: () => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}) {
  // Only recomputes when the applied (not pending) filter changes — the regex scan runs once
  // per "Apply" click rather than on every keystroke, so typing a pattern never lags the UI.
  const filtered = useMemo(() => {
    if (!generatedResult) return { result: [], error: null };
    return applyPatternFilter(generatedResult.candidates, appliedFilterPattern, appliedFilterMode);
  }, [generatedResult, appliedFilterPattern, appliedFilterMode]);

  const [filename, setFilename] = useEditableFilename(`subdomains-${baseDomain || "wordlist"}.txt`);

  if (!generatedResult) {
    return <Callout variant="info">Pick your options above, then click Generate.</Callout>;
  }

  const outputText = filtered.result.join("\n");
  const hasUnappliedChanges = pendingFilterPattern !== appliedFilterPattern || pendingFilterMode !== appliedFilterMode;

  const resolverCommands = [
    {
      name: "puredns",
      command: `puredns resolve ${filename} -r resolvers.txt --write resolved.txt`,
      description:
        "resolves the subdomains while automatically filtering out wildcard DNS entries that would give false positives.",
    },
    {
      name: "massdns",
      command: `massdns -r resolvers.txt -t A -o S ${filename} | cut -d' ' -f1 | sort -u > resolved.txt`,
      description:
        "performs fast bulk A record lookups; -o S prints \"name type data\" per record, so cutting field 1 and deduplicating gives you the list of subdomains that resolved (not the IPs; those are field 3).",
    },
    {
      name: "dnsx",
      command: `dnsx -l ${filename} -r resolvers.txt -a -o resolved.txt`,
      description: "resolves the subdomains for A records with a clean output, but does not handle wildcard filtering on its own.",
    },
    {
      name: "shuffledns",
      command: `shuffledns -d ${baseDomain || "example.com"} -list ${filename} -r resolvers.txt -mode resolve -o resolved.txt`,
      description:
        "resolves the subdomains using massdns under the hood and filters out wildcards by comparing responses against a baseline for your target domain.",
    },
    {
      name: "zdns",
      command: `zdns A --input-file=${filename} --name-servers=@resolvers.txt --output-file=resolved.json`,
      description: "performs A record lookups at scale and outputs the full JSON results including response details and timing for every query.",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={pendingFilterPattern}
          onChange={(e) => onPendingFilterPatternChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApplyFilter();
          }}
          placeholder="Regex filter (optional)"
          className={`${inputClasses} flex-1`}
        />
        <button
          type="button"
          onClick={() => onPendingFilterModeChange("include")}
          className={toggleButtonClasses(pendingFilterMode === "include")}
        >
          Include
        </button>
        <button
          type="button"
          onClick={() => onPendingFilterModeChange("exclude")}
          className={toggleButtonClasses(pendingFilterMode === "exclude")}
        >
          Exclude
        </button>
        <button
          type="button"
          onClick={onApplyFilter}
          disabled={!hasUnappliedChanges}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Apply
        </button>
        <select value={sortMode} onChange={(e) => onSortModeChange(e.target.value as SortMode)} className={selectClasses}>
          <option value="alpha">Sort: A-Z</option>
          <option value="length">Sort: length</option>
        </select>
      </div>
      {filtered.error && <p className="text-xs text-red-600 dark:text-red-400">Invalid pattern: {filtered.error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {filtered.result.length.toLocaleString()}
          {filtered.result.length !== generatedResult.candidates.length && ` of ${generatedResult.candidates.length.toLocaleString()}`}{" "}
          candidates
        </p>
        <div className="flex items-center gap-2">
          <FilenameInput value={filename} onChange={setFilename} />
          <CopyButton text={outputText} disabled={outputText.length === 0} />
          <DownloadButton content={outputText} filename={filename} mimeType="text/plain" />
        </div>
      </div>

      {generatedResult.cappedAt !== null && (
        <Callout variant="warning">
          Capped at {generatedResult.cappedAt.toLocaleString()} candidates. Raise the max output above to generate more.
        </Callout>
      )}

      <textarea
        readOnly
        value={outputText}
        rows={14}
        className={`${inputClasses} resize-y`}
      />

      <details className="rounded border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Resolve these candidates</summary>
        <div className="flex flex-col gap-2 px-3 pb-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This tool only generates candidate names. Nothing here queries DNS. Save the output above as{" "}
            <code>{filename}</code>, then pipe it into a resolver with one of the commands below (each expects a{" "}
            <code>resolvers.txt</code> file of resolver IPs, one per line):
          </p>
          <ul className="flex flex-col gap-2">
            {resolverCommands.map((tool) => (
              <li key={tool.name} className="rounded border border-zinc-200 p-2.5 dark:border-zinc-700">
                <div className="flex items-start justify-between gap-2">
                  <code className="break-all text-xs text-zinc-800 dark:text-zinc-200">{tool.command}</code>
                  <CopyButton text={tool.command} />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">{tool.name}</span>: {tool.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
