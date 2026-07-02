"use client";

import { useEffect, useRef, useState } from "react";
import { identifyHash } from "@/lib/hash/detect";
import { isVerifiable, verifyPlaintext } from "@/lib/hash/verify";
import { HashResultPanel } from "./HashResultPanel";

export function HashIdentifierTool() {
  const [draftInput, setDraftInput] = useState("");
  const [submittedInput, setSubmittedInput] = useState("");
  const [lastSyncedInput, setLastSyncedInput] = useState<string | null>(null);
  const [plaintext, setPlaintext] = useState("");
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "checking" | "no-match">("idle");

  // Bumped on every Verify/Reset/new-hash-submission so an in-flight verifyPlaintext() that
  // resolves afterward can detect it's stale and skip applying its now-outdated result.
  const verifyRequestId = useRef(0);

  const result = identifyHash(submittedInput);

  // Any previously confirmed candidate applied to a *different* submitted hash is stale —
  // clear it whenever a new hash is submitted (React's "adjust state during render" pattern).
  if (submittedInput !== lastSyncedInput) {
    setLastSyncedInput(submittedInput);
    setConfirmedId(null);
    setVerifyStatus("idle");
  }

  // Invalidate any in-flight verify request whenever the submitted hash changes — refs can't
  // be mutated during render, so this runs as an effect right after the state above commits.
  useEffect(() => {
    verifyRequestId.current++;
  }, [submittedInput]);

  const verifiableCandidates =
    result.kind === "matched" ? result.candidates.filter((c) => isVerifiable(c.signature.id)) : [];

  async function handleVerify() {
    if (result.kind !== "matched") return;
    const requestId = ++verifyRequestId.current;
    setVerifyStatus("checking");
    const matchedId = await verifyPlaintext(result.candidates, result.hashPart, plaintext);
    if (verifyRequestId.current !== requestId) return;
    setConfirmedId(matchedId);
    setVerifyStatus(matchedId ? "idle" : "no-match");
  }

  function handleResetVerification() {
    verifyRequestId.current++;
    setPlaintext("");
    setConfirmedId(null);
    setVerifyStatus("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Hash</label>
        <div className="flex gap-2">
          <textarea
            value={draftInput}
            onChange={(e) => setDraftInput(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="Paste a single hash (e.g. an MD5, SHA-1, NTLM, or bcrypt hash)"
            className="w-full rounded border border-zinc-300 bg-white p-3 font-mono text-xs break-all outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => setSubmittedInput(draftInput)}
            className="shrink-0 self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Submit
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          One hash at a time — batch identification of hash lists is planned for a future update.
        </p>
      </div>

      {verifiableCandidates.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Known or guessed plaintext (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="e.g. password"
              className="w-full rounded border border-zinc-300 bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={plaintext.length === 0 || verifyStatus === "checking"}
              className="shrink-0 rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={handleResetVerification}
              disabled={plaintext.length === 0 && confirmedId === null && verifyStatus === "idle"}
              className="shrink-0 rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Reset
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Computed entirely in your browser — this text is never sent anywhere. If it matches
            one of the candidates below (e.g. MD5 vs NTLM), that candidate is confirmed.
          </p>
          {verifyStatus === "no-match" && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              That plaintext didn&apos;t match any of the computable candidates below.
            </p>
          )}
        </div>
      )}

      <HashResultPanel result={result} confirmedId={confirmedId} />
    </div>
  );
}
