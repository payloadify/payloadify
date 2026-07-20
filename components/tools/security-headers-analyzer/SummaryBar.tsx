"use client";

import { SecurityHeadersResponse } from "@/lib/security-headers/types";

export function SummaryBar({ data }: { data: SecurityHeadersResponse }) {
  const { summary } = data;
  return (
    <div className="rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <div className="text-lg font-semibold tracking-tight">
        {summary.passingSecurityHeaders} of {summary.totalSecurityHeaders} recommended headers present
      </div>
      {summary.informationDisclosureCount > 0 && (
        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
          {summary.informationDisclosureCount} information-disclosure header{summary.informationDisclosureCount === 1 ? "" : "s"} found.
        </p>
      )}
      {data.redirected && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Redirected: analyzed the final response from <code className="font-mono">{data.finalUrl}</code>.
        </p>
      )}
    </div>
  );
}
