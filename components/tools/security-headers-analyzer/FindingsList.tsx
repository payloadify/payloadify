"use client";

import { SecurityHeaderFinding } from "@/lib/security-headers/types";
import { HeaderFindingCard } from "./HeaderFindingCard";

export function FindingsList({ findings }: { findings: SecurityHeaderFinding[] }) {
  const securityFindings = findings.filter((f) => f.polarity === "present-good");
  const disclosureFindings = findings.filter((f) => f.polarity === "present-bad");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Security Headers</h3>
        <div className="flex flex-col gap-2">
          {securityFindings.map((finding) => (
            <HeaderFindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Information Disclosure</h3>
        <div className="flex flex-col gap-2">
          {disclosureFindings.map((finding) => (
            <HeaderFindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </div>
    </div>
  );
}
