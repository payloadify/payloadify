"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { SecurityHeaderFinding } from "@/lib/security-headers/types";
import { HEADER_STATUS_CLASSES, headerStatusLabel } from "./statusClasses";

export function HeaderFindingCard({ finding }: { finding: SecurityHeaderFinding }) {
  const statusLabel = headerStatusLabel(finding);
  const copyText = `${finding.label}: ${statusLabel} — ${finding.detail}`;

  return (
    <div className="flex flex-col gap-1.5 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{finding.label}</div>
        <span className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${HEADER_STATUS_CLASSES[finding.status]}`}>
          {statusLabel}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{finding.explanation}</p>
      <code className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900">{finding.detail}</code>
      {finding.recommendation && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">Recommendation: {finding.recommendation}</p>
      )}
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex gap-3 text-xs">
          <a href={finding.owaspUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            OWASP
          </a>
          <a href={finding.mdnUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            MDN
          </a>
        </div>
        <CopyButton text={copyText} label="Copy" />
      </div>
    </div>
  );
}
