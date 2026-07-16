"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { WrappableCode } from "@/components/ui/WrappableCode";
import { SpfResult } from "@/lib/email-auth/types";

const ALL_QUALIFIER_EXPLANATIONS: Record<string, string> = {
  "-": "-all (fail) — strict: mail from sources not listed should be rejected.",
  "~": "~all (softfail) — mail from sources not listed should be flagged/accepted with suspicion, not hard-rejected.",
  "?": "?all (neutral) — no policy assertion either way; provides little protection.",
  "+": "+all (pass) — explicitly allows mail from ANY source. This is dangerous and defeats the purpose of SPF.",
};

export function SpfResultPanel({ spf }: { spf: SpfResult }) {
  if (!spf.found) {
    return (
      <div className="flex flex-col gap-1.5 rounded border border-zinc-300 p-3 dark:border-zinc-700">
        <div className="font-medium">SPF</div>
        <p className="text-sm text-red-600 dark:text-red-400">No SPF record found.</p>
      </div>
    );
  }

  const copyText = spf.record
    ? `SPF: ${spf.record}`
    : `SPF: ${spf.records.length} records found (multiple v=spf1 records — invalid per RFC 7208 §4.5).`;

  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">SPF</div>
        <CopyButton text={copyText} label="Copy" />
      </div>

      {spf.multipleRecords && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {spf.records.length} SPF records found — a domain must publish exactly one. Multiple records is a common misconfiguration
          (RFC 7208 §4.5) and can cause mail receivers to treat SPF as a PermError.
        </p>
      )}

      {spf.record && (
        <>
          <WrappableCode text={spf.record} />

          {spf.allQualifier && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{ALL_QUALIFIER_EXPLANATIONS[spf.allQualifier]}</p>
          )}
          {!spf.allQualifier && (
            <p className="text-sm text-amber-600 dark:text-amber-400">No &quot;all&quot; mechanism found — the record doesn&apos;t specify a catch-all policy.</p>
          )}

          {spf.deprecatedPtrUsed && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Uses the &quot;ptr&quot; mechanism, which RFC 7208 §5.5 deprecates — it&apos;s slow and unreliable, and its use is discouraged.
            </p>
          )}

          <p className={`text-sm ${spf.lookupCountExceeded ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}`}>
            ~{spf.lookupCount} DNS lookup{spf.lookupCount === 1 ? "" : "s"} counted against the RFC 7208 §4.6.4 limit of 10
            {spf.lookupCountExceeded ? " — over the limit, mail receivers should treat this as a PermError." : "."}
            {spf.lookupCountTruncated && !spf.lookupCountExceeded && " A circular include chain was detected, so this count is a floor, not exact."}
          </p>

          {spf.mechanisms.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mechanisms</div>
              <ul className="flex flex-col gap-0.5">
                {spf.mechanisms.map((m, i) => (
                  <li key={i} className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {m.raw}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
