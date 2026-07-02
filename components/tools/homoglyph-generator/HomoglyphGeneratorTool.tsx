"use client";

import { useMemo, useState } from "react";
import { applySelections, getAlternativesFor, randomizeText } from "@/lib/homoglyph/generate";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";

const inputClasses =
  "w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const selectClasses =
  "rounded border border-zinc-300 bg-white px-1.5 py-1 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function HomoglyphGeneratorTool() {
  const [input, setInput] = useState("");
  const [selections, setSelections] = useState<Map<number, string>>(new Map());

  const chars = useMemo(() => Array.from(input), [input]);
  const alternativesByIndex = useMemo(() => chars.map((char) => getAlternativesFor(char)), [chars]);
  const { output, substitutions } = useMemo(() => applySelections(input, selections), [input, selections]);

  function updateInput(value: string) {
    setInput(value);
    setSelections(new Map());
  }

  function randomize() {
    if (input.length === 0) return;
    const result = randomizeText(input);
    setSelections(new Map(result.substitutions.map((s) => [s.index, s.replacement])));
  }

  function setSelection(index: number, replacement: string) {
    setSelections((prev) => {
      const next = new Map(prev);
      if (replacement === "") next.delete(index);
      else next.set(index, replacement);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Text to substitute</label>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => updateInput(e.target.value)}
            rows={2}
            spellCheck={false}
            placeholder="Type or paste the text to generate a lookalike version of"
            className={inputClasses}
          />
          <button
            type="button"
            onClick={randomize}
            disabled={input.length === 0}
            className="shrink-0 self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Randomize
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Computed entirely in your browser — this text is never sent anywhere.
        </p>
      </div>

      {input.length === 0 && (
        <Callout variant="info">Enter some text above, then click Randomize or pick substitutions below.</Callout>
      )}

      {chars.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Custom substitution
          </p>
          <div className="flex flex-wrap items-center gap-1 rounded border border-zinc-200 p-3 dark:border-zinc-800">
            {chars.map((char, index) => {
              const alternatives = alternativesByIndex[index];
              if (alternatives.length === 0) {
                return (
                  <span key={index} className="px-1 py-1 font-mono text-sm text-zinc-400 dark:text-zinc-600">
                    {char}
                  </span>
                );
              }
              return (
                <select
                  key={index}
                  value={selections.get(index) ?? ""}
                  onChange={(e) => setSelection(index, e.target.value)}
                  className={selectClasses}
                  aria-label={`Substitution for character ${index + 1} ("${char}")`}
                >
                  <option value="">{char}</option>
                  {alternatives.map((alt) => (
                    <option key={alt.char} value={alt.char}>
                      {alt.char} — {alt.script} ({alt.codePoint})
                    </option>
                  ))}
                </select>
              );
            })}
          </div>
        </div>
      )}

      {input.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Original
            </p>
            <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
              {input}
            </code>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Generated
              </p>
              <CopyButton text={output} />
            </div>
            <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
              {output}
            </code>
          </div>
        </div>
      )}

      {substitutions.length > 0 && (
        <div className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {substitutions.map((sub) => (
            <div key={sub.index} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div className="flex items-center gap-3 font-mono">
                <span>{sub.original}</span>
                <span className="text-zinc-400">→</span>
                <span className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{sub.replacement}</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">position {sub.index + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
