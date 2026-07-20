"use client";

import { useEffect, useRef } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { inputClasses } from "@/components/ui/formClasses";
import { CvssMeta } from "@payloadify/cvss-core";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

const COLLAPSED_KEY = "payloadify:cvss-calculator:description-impact-collapsed";

/** Grows both textareas together to fit whichever has more content, so the pair always matches
 *  height instead of each sizing independently — capped by the max-h-60 class below (after which
 *  each textarea's own overflow-y-auto takes over). Keyed on both values rather than an input
 *  handler so it also resizes on programmatic changes — auto-fill on vuln-type selection,
 *  template/chain switches, loading a saved template — not just direct typing. */
function useMatchedAutoResizeTextareas(valueA: string, valueB: string, collapsed: boolean) {
  const refA = useRef<HTMLTextAreaElement>(null);
  const refB = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // While collapsed the container is display:none, so scrollHeight reads 0 — skip and let
    // the resize re-run once expanded (below) rather than pinning the textareas to 0px.
    if (collapsed) return;
    const elA = refA.current;
    const elB = refB.current;
    if (!elA || !elB) return;
    elA.style.height = "auto";
    elB.style.height = "auto";
    const target = Math.max(elA.scrollHeight, elB.scrollHeight);
    elA.style.height = `${target}px`;
    elB.style.height = `${target}px`;
  }, [valueA, valueB, collapsed]);
  return [refA, refB] as const;
}

export function DescriptionImpactFields({
  meta,
  onMetaChange,
  showChainedImpact = false,
}: {
  meta: CvssMeta;
  onMetaChange: (patch: Partial<CvssMeta>) => void;
  /** Whether a chain pair is currently selected — the Chained Impact field only makes sense to
   *  show once there's a second vuln type to combine with. */
  showChainedImpact?: boolean;
}) {
  const [collapsed, setCollapsed] = usePersistedBoolean(COLLAPSED_KEY, false);
  const [descriptionRef, impactRef] = useMatchedAutoResizeTextareas(meta.description, meta.impact, collapsed);

  return (
    <div className="rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Vulnerability Description &amp; Impact
        <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
      </button>

      {/* CSS-hidden rather than unmounted when collapsed, so the textarea DOM nodes (and their
          auto-resized inline height) survive a collapse/expand round trip. */}
      <div className={collapsed ? "hidden" : "mt-3 grid gap-4 sm:grid-cols-2"}>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Description (editable)</label>
            <CopyButton text={meta.description} label="Copy" disabled={meta.description.trim() === ""} />
          </div>
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-500">
            Auto-filled starting draft. Edit to fit your specific finding before using.
          </p>
          <textarea
            ref={descriptionRef}
            value={meta.description}
            onChange={(e) => onMetaChange({ description: e.target.value })}
            rows={3}
            placeholder="Describe the vulnerability..."
            className={`${inputClasses} max-h-60 resize-none overflow-y-auto font-sans`}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Impact (editable)</label>
            <CopyButton text={meta.impact} label="Copy" disabled={meta.impact.trim() === ""} />
          </div>
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-500">
            Auto-filled starting draft. Edit to fit your specific finding before using.
          </p>
          <textarea
            ref={impactRef}
            value={meta.impact}
            onChange={(e) => onMetaChange({ impact: e.target.value })}
            rows={3}
            placeholder="Describe the impact..."
            className={`${inputClasses} max-h-60 resize-none overflow-y-auto font-sans`}
          />
        </div>
      </div>

      {showChainedImpact && !collapsed && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Chained Impact (editable)</label>
            <CopyButton text={meta.chainedImpact} label="Copy" disabled={meta.chainedImpact.trim() === ""} />
          </div>
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-500">
            For well-documented pairs this is a real write-up; otherwise it's a prompt scaffold: describe the specific
            attack path yourself rather than trusting a generated guess.
          </p>
          <textarea
            value={meta.chainedImpact}
            onChange={(e) => onMetaChange({ chainedImpact: e.target.value })}
            rows={3}
            placeholder="Describe how chaining these two vulnerabilities increases impact..."
            className={`${inputClasses} max-h-60 resize-y font-sans`}
          />
        </div>
      )}
    </div>
  );
}
