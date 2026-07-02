"use client";

import { useState } from "react";
import { HASH_ALGORITHMS_BY_ID } from "@/lib/hash/algorithms";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";

// Explicit, ordered subset of the shared algorithm list — kept in sync with every
// non-salted algorithm lib/hash/signatures.ts can detect, so Identify and Generate
// support the identical set. Salted/KDF formats (bcrypt, phpass, *crypt, SSHA, etc.)
// and hand-roll-risk obscure algorithms (MD2, RIPEMD-128/256, Tiger-128, HAVAL, LM,
// Whirlpool) are intentionally excluded — see CLAUDE.md's future-ideas note on bcrypt.
const GENERATOR_ALGORITHM_IDS = [
  "md5",
  "md4",
  "ntlm",
  "sha1",
  "sha224",
  "sha256",
  "sha384",
  "sha512",
  "sha3-256",
  "ripemd160",
];

type Results = Record<string, string>;

export function HashGeneratorTool() {
  const [draftInput, setDraftInput] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  async function handleGenerate() {
    if (draftInput.length === 0) return;
    setIsComputing(true);
    const entries = await Promise.all(
      GENERATOR_ALGORITHM_IDS.map(async (id) => {
        const algorithm = HASH_ALGORITHMS_BY_ID[id];
        return [id, await algorithm.compute(draftInput)] as const;
      }),
    );
    setResults(Object.fromEntries(entries));
    setIsComputing(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Plaintext</label>
        <div className="flex gap-2">
          <textarea
            value={draftInput}
            onChange={(e) => setDraftInput(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="Type or paste the text to hash"
            className="w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={draftInput.length === 0 || isComputing}
            className="shrink-0 self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Generate
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Computed entirely in your browser — this text is never sent anywhere.
        </p>
      </div>

      {!results && <Callout variant="info">Enter some text above and click Generate to compute its hashes.</Callout>}

      {results && (
        <div className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {GENERATOR_ALGORITHM_IDS.map((id) => {
            const algorithm = HASH_ALGORITHMS_BY_ID[id];
            return (
              <div key={id} className="flex flex-col gap-1 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{algorithm.name}</span>
                  <CopyButton text={results[id]} />
                </div>
                <code className="break-all text-xs text-zinc-600 dark:text-zinc-400">{results[id]}</code>
                {algorithm.note && <p className="text-xs text-amber-700 dark:text-amber-400">{algorithm.note}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
