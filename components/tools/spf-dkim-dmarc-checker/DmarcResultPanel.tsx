"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { WrappableCode } from "@/components/ui/WrappableCode";
import { DmarcResult, DmarcPolicy } from "@/lib/email-auth/types";

const POLICY_EXPLANATIONS: Record<DmarcPolicy, string> = {
  none: "none — monitoring-only. Reports are generated but nothing is enforced against failing mail.",
  quarantine: "quarantine — mail failing DMARC checks should be treated as suspicious (e.g. sent to spam).",
  reject: "reject — mail failing DMARC checks should be rejected outright.",
};

export function DmarcResultPanel({ dmarc }: { dmarc: DmarcResult }) {
  if (!dmarc.found) {
    return (
      <div className="flex flex-col gap-1.5 rounded border border-zinc-300 p-3 dark:border-zinc-700">
        <div className="font-medium">DMARC</div>
        <p className="text-sm text-red-600 dark:text-red-400">No DMARC record found at _dmarc.{dmarc.domain}.</p>
      </div>
    );
  }

  const copyText = dmarc.record ? `DMARC: ${dmarc.record}` : "DMARC: multiple records found.";

  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">DMARC</div>
        <CopyButton text={copyText} label="Copy" />
      </div>

      {dmarc.multipleRecords && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {dmarc.records.length} DMARC records found at this domain — a domain should publish exactly one (RFC 7489 §6.1). Behavior
          with multiple records is undefined by receivers.
        </p>
      )}

      {dmarc.record && (
        <>
          <WrappableCode text={dmarc.record ?? ""} />

          {dmarc.policy && (
            <p className={`text-sm ${dmarc.monitoringOnly ? "text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}>
              Policy (p=): {POLICY_EXPLANATIONS[dmarc.policy]}
            </p>
          )}
          {!dmarc.policy && <p className="text-sm text-amber-600 dark:text-amber-400">No recognized policy (p=) tag found.</p>}

          {dmarc.subdomainPolicy && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Subdomain policy (sp=): {POLICY_EXPLANATIONS[dmarc.subdomainPolicy]}
              {dmarc.subdomainPolicyInherited && " (inherited from p=, no explicit sp= tag set)"}
            </p>
          )}

          <p className={`text-sm ${dmarc.pctBelow100 ? "text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}>
            Applies to {dmarc.pct}% of mail{dmarc.pctBelow100 ? " — the policy only enforces against a portion of failing mail." : "."}
          </p>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Alignment — DKIM: {dmarc.adkim === "s" ? "strict" : "relaxed"}, SPF: {dmarc.aspf === "s" ? "strict" : "relaxed"}
          </p>

          {dmarc.rua.length > 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Aggregate reports (rua): {dmarc.rua.join(", ")}</p>
          )}
          {dmarc.ruf.length > 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Forensic reports (ruf): {dmarc.ruf.join(", ")}</p>
          )}
          {dmarc.rua.length === 0 && dmarc.ruf.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">No reporting addresses (rua/ruf) configured — failures won&apos;t be reported anywhere.</p>
          )}
        </>
      )}
    </div>
  );
}
