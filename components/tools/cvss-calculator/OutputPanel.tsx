"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { iconButtonClasses, inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import {
  CvssMeta,
  CvssReference,
  CWE_CATEGORY_LABELS,
  CWE_CATEGORY_ORDER,
  CWE_ENTRIES,
  CWE_ENTRIES_BY_ID,
  OWASP_CATEGORIES,
  OWASP_CATEGORIES_BY_ID,
  OWASP_GROUP_LABELS,
  OWASP_GROUP_ORDER,
  owaspGroupOf,
  OwaspWebVersion,
  Platform,
  SeverityRating,
  VRT_AUTOFILL,
  VRT_CATEGORIES,
  VRT_CATEGORIES_BY_ID,
  VRT_VERSION,
} from "@payloadify/cvss-core";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/SearchableSelect";

const ADDITIONAL_INFO_COLLAPSED_KEY = "payloadify:cvss-calculator:additional-info-collapsed";

const SEVERITY_CLASSES: Record<SeverityRating, string> = {
  None: "text-zinc-600 dark:text-zinc-400",
  Low: "text-blue-600 dark:text-blue-400",
  Medium: "text-amber-600 dark:text-amber-400",
  High: "text-orange-600 dark:text-orange-400",
  Critical: "text-red-600 dark:text-red-400",
};

export function OutputPanel({
  baseScore,
  severity,
  vector,
  meta,
  onMetaChange,
  owaspWebVersion,
  onOwaspWebVersionChange,
  platform,
}: {
  baseScore: number;
  severity: SeverityRating;
  vector: string;
  meta: CvssMeta;
  onMetaChange: (patch: Partial<CvssMeta>) => void;
  owaspWebVersion: OwaspWebVersion;
  onOwaspWebVersionChange: (version: OwaspWebVersion) => void;
  platform: Platform;
}) {
  const owasp = meta.owaspRefId ? OWASP_CATEGORIES_BY_ID[meta.owaspRefId] : null;
  const vrt = meta.vrtRefId ? VRT_CATEGORIES_BY_ID[meta.vrtRefId] : null;
  const cwe = meta.cweId ? CWE_ENTRIES_BY_ID[meta.cweId] : null;
  const [collapsed, setCollapsed] = usePersistedBoolean(ADDITIONAL_INFO_COLLAPSED_KEY, false);
  const [showOwaspApiNote, setShowOwaspApiNote] = useState(false);

  // OWASP's API Security Top 10 (2023) has no category of its own for classic injection
  // (SQLi/command injection/XXE) or for insecure deserialization — those are only covered under
  // the main OWASP Top 10 (Web), so an "api"-platform finding can legitimately still cite a Web
  // category. Surface that as an info tooltip rather than silently showing what looks like a
  // platform mismatch.
  const owaspGroup = meta.owaspRefId ? owaspGroupOf(meta.owaspRefId) : null;
  const showOwaspApiNoteToggle = platform === "api" && (owaspGroup === "web-2021" || owaspGroup === "web-2025");

  // Both Web editions are always shown as separate optgroups (never hidden), even though
  // flipping owaspWebVersion also re-resolves the currently selected category (see
  // CvssCalculatorTool's changeOwaspWebVersion) — manual picks from either edition should
  // still be selectable at any time.
  const owaspOptions: SearchableSelectOption[] = OWASP_GROUP_ORDER.flatMap((group) =>
    OWASP_CATEGORIES.filter((c) => owaspGroupOf(c.id) === group).map((c) => ({
      value: c.id,
      label: c.label,
      group: OWASP_GROUP_LABELS[group],
    })),
  );

  const vrtGroupOrder = [...new Set(VRT_CATEGORIES.map((c) => c.group))].sort((a, b) => a.localeCompare(b));
  const vrtOptions: SearchableSelectOption[] = vrtGroupOrder.flatMap((group) =>
    [...VRT_CATEGORIES.filter((c) => c.group === group)]
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((v) => ({
        value: v.id,
        label: `${v.label}${v.priority ? ` (${v.priority})` : ""}`,
        group,
      })),
  );

  // The broad "parent" CWE for a category (if any) is always sorted first within its group,
  // flagged as such in the UI, since it's commonly picked as a fallback when the reporter isn't
  // sure of the exact child weakness even though CWE itself discourages mapping to it directly.
  const cweOptions: SearchableSelectOption[] = CWE_CATEGORY_ORDER.flatMap((category) =>
    CWE_ENTRIES.filter((c) => c.category === category)
      .sort((a, b) => (a.isParent === b.isParent ? Number(a.id.slice(4)) - Number(b.id.slice(4)) : a.isParent ? -1 : 1))
      .map((c) => ({
        value: c.id,
        label: `${c.isParent ? "" : "↳ "}${c.id}: ${c.label}${c.isParent ? " (broad)" : ""}`,
        group: CWE_CATEGORY_LABELS[category],
        searchText: c.id,
      })),
  );

  function handleVrtChange(newVrtId: string) {
    if (!newVrtId) {
      onMetaChange({ vrtRefId: null });
      return;
    }
    const autofill = VRT_AUTOFILL[newVrtId];
    // Picking a VRT category seeds CWE + references as a starting point — the user can still
    // change or delete them individually afterward, this doesn't lock the fields.
    onMetaChange(autofill ? { vrtRefId: newVrtId, cweId: autofill.cweId, references: autofill.references } : { vrtRefId: newVrtId });
  }

  function updateReference(index: number, patch: Partial<CvssReference>) {
    onMetaChange({ references: meta.references.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
  }

  function removeReference(index: number) {
    onMetaChange({ references: meta.references.filter((_, i) => i !== index) });
  }

  function addReference() {
    onMetaChange({ references: [...meta.references, { label: "", url: "" }] });
  }

  function clearAllMeta() {
    onMetaChange({ rationale: "", owaspRefId: null, vrtRefId: null, cweId: null, references: [] });
  }

  const hasAnyMeta = meta.rationale.trim() !== "" || meta.owaspRefId || meta.vrtRefId || meta.cweId || meta.references.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tracking-tight">{baseScore.toFixed(1)}</span>
          <span className={`text-sm font-medium ${SEVERITY_CLASSES[severity]}`}>{severity}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-900">{vector}</code>
          <CopyButton text={vector} label="Copy Vector" />
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            className="flex flex-1 items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Additional Info
            <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">Rationale / notes (optional)</label>
              <textarea
                value={meta.rationale}
                onChange={(e) => onMetaChange({ rationale: e.target.value })}
                rows={2}
                placeholder="Free-text notes for this finding, not included unless you add it in Copy All."
                className={`${inputClasses} font-sans`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-500">OWASP Category</label>
                    {showOwaspApiNoteToggle && (
                      <button
                        type="button"
                        onClick={() => setShowOwaspApiNote((v) => !v)}
                        aria-expanded={showOwaspApiNote}
                        aria-label="Why does this API finding cite a Web OWASP category?"
                        title="Why does this API finding cite a Web OWASP category?"
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-400 text-[10px] leading-none text-zinc-500 hover:border-zinc-600 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-200"
                      >
                        i
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">Web edition:</span>
                    {(["2021", "2025"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={toggleButtonClasses(owaspWebVersion === v)}
                        onClick={() => onOwaspWebVersionChange(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <SearchableSelect
                  value={meta.owaspRefId ?? ""}
                  onChange={(v) => onMetaChange({ owaspRefId: v || null })}
                  options={owaspOptions}
                  placeholder="Search OWASP categories..."
                  ariaLabel="OWASP Category"
                />
              </div>
              {owasp && <CopyButton text={owasp.label} label="Copy" />}
            </div>
            {showOwaspApiNoteToggle && showOwaspApiNote && (
              <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                This finding is on the API platform, but OWASP&apos;s API Security Top 10 has no category of its own for this
                vulnerability type. It&apos;s only covered under the main OWASP Top 10 (Web), so that category is cited instead.
              </p>
            )}

            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">VRT Category</label>
                <SearchableSelect
                  value={meta.vrtRefId ?? ""}
                  onChange={handleVrtChange}
                  options={vrtOptions}
                  placeholder="Search VRT categories..."
                  ariaLabel="VRT Category"
                />
              </div>
              {vrt && <CopyButton text={`VRT ${VRT_VERSION} - ${vrt.label}`} label="Copy" />}
            </div>
            {vrt?.inferred && (
              <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-500">Inferred: not a literal VRT leaf. {vrt.note}</p>
            )}

            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">CWE</label>
                <SearchableSelect
                  value={meta.cweId ?? ""}
                  onChange={(v) => onMetaChange({ cweId: v || null })}
                  options={cweOptions}
                  placeholder="Search CWE (id or name)..."
                  ariaLabel="CWE"
                />
              </div>
              {cwe && <CopyButton text={`${cwe.id}: ${cwe.label}`} label="Copy" />}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-500">References</label>
                {meta.references.length > 0 && <CopyButton text={meta.references.map((r) => r.url).join("\n")} label="Copy all" />}
              </div>
              <div className="flex flex-col gap-2">
                {meta.references.map((ref, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ref.label}
                      onChange={(e) => updateReference(i, { label: e.target.value })}
                      placeholder="Label, e.g. PortSwigger: XSS"
                      className={`${inputClasses} flex-1 font-sans`}
                    />
                    <input
                      type="text"
                      value={ref.url}
                      onChange={(e) => updateReference(i, { url: e.target.value })}
                      placeholder="https://..."
                      className={`${inputClasses} flex-1 font-sans`}
                    />
                    <button
                      type="button"
                      onClick={() => removeReference(i)}
                      aria-label={`Remove reference ${i + 1}`}
                      className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addReference} className={`${iconButtonClasses} mt-2`}>
                + Add Reference
              </button>
            </div>

            {hasAnyMeta && (
              <button type="button" onClick={clearAllMeta} className={`${iconButtonClasses} self-start`}>
                Clear Additional Info
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
