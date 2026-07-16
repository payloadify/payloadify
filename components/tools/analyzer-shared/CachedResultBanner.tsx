"use client";

import { Callout } from "@/components/ui/Callout";

/** Shared between the Security Headers Analyzer and the SPF/DKIM/DMARC Checker — both cache
 *  Worker-side results per ANALYZER-SPECS.md's caching section, and both need this same "you're
 *  looking at a cached result, here's how to force a fresh one" affordance. */
export function CachedResultBanner({ onForceFresh, loading }: { onForceFresh: () => void; loading: boolean }) {
  return (
    <Callout variant="info">
      <div className="flex items-center justify-between gap-3">
        <span>Showing a cached result (up to a few minutes old).</span>
        <button
          type="button"
          onClick={onForceFresh}
          disabled={loading}
          className="shrink-0 rounded border border-blue-300 px-2 py-1 text-xs text-blue-900 hover:border-blue-400 disabled:opacity-50 dark:border-blue-800 dark:text-blue-200 dark:hover:border-blue-600"
        >
          {loading ? "Checking…" : "Force fresh check"}
        </button>
      </div>
    </Callout>
  );
}
