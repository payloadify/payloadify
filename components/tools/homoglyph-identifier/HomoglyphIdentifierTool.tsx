"use client";

import { useMemo, useState, type ReactNode } from "react";
import { identifyHomoglyphs } from "@/lib/homoglyph/identify";
import { Callout } from "@/components/ui/Callout";

const inputClasses =
  "w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function HomoglyphIdentifierTool() {
  const [input, setInput] = useState("");
  const flagged = useMemo(() => identifyHomoglyphs(input), [input]);
  const flaggedByStart = useMemo(() => new Map(flagged.map((f) => [f.index, f])), [flagged]);
  const inputChars = useMemo(() => Array.from(input), [input]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Text to check</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="Paste a domain name or other text to check for homoglyph/confusable characters"
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Computed entirely in your browser — this text is never sent anywhere.
        </p>
      </div>

      {input.length === 0 && (
        <Callout variant="info">Enter some text above to scan it for confusable Unicode characters.</Callout>
      )}

      {input.length > 0 && flagged.length === 0 && (
        <Callout variant="success">No confusable characters detected.</Callout>
      )}

      {flagged.length > 0 && (
        <>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Preview
            </p>
            <p className="rounded border border-zinc-200 bg-white p-3 font-mono text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
              {(() => {
                const nodes: ReactNode[] = [];
                let index = 0;
                while (index < inputChars.length) {
                  const match = flaggedByStart.get(index);
                  if (match) {
                    nodes.push(
                      <mark
                        key={index}
                        title={`${match.codePoint} (${match.script}) — impersonates "${match.impersonates}" (${match.impersonatesCodePoints.join(", ")})`}
                        className="rounded bg-red-200 text-red-900 underline decoration-red-500 decoration-2 dark:bg-red-950 dark:text-red-200"
                      >
                        {match.char}
                      </mark>
                    );
                    index += [...match.char].length;
                  } else {
                    nodes.push(<span key={index}>{inputChars[index]}</span>);
                    index += 1;
                  }
                }
                return nodes;
              })()}
            </p>
          </div>

          <div className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {flagged.map((match) => (
              <div key={match.index} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-red-200 px-2 py-0.5 font-mono text-base text-red-900 dark:bg-red-950 dark:text-red-200">
                    {match.char}
                  </span>
                  <div>
                    <p className="font-medium">
                      {match.codePoint} — {match.script}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Impersonates &quot;{match.impersonates}&quot; ({match.impersonatesCodePoints.join(", ")})
                    </p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">position {match.index + 1}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
