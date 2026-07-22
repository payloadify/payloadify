"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { checkboxLabelClasses, iconButtonClasses, inputClasses } from "@/components/ui/formClasses";
import { Callout } from "@/components/ui/Callout";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { CvssMeta, CvssReportImportDetection, CvssVersion, Cvss31Metrics, Cvss40Metrics, detectCvssFieldsFromReport } from "@payloadify/cvss-core";

export interface ReportImportApplyPayload {
  version?: CvssVersion;
  metrics31?: Cvss31Metrics;
  metrics40?: Cvss40Metrics;
  metaPatch: Partial<CvssMeta>;
}

type SingleFieldKey = "title" | "description" | "impact" | "notes" | "cwe" | "owasp";

/** "Paste your own report -> preview what was detected -> confirm" modal for the CVSS Calculator.
 *  Every detected field is opt-in (checkbox, checked by default) and nothing here ever touches
 *  localStorage or the network — Apply only patches the caller's in-memory working form state, it
 *  never auto-saves a template. Follows the same portal + focus-trap modal pattern as
 *  ChangelogModal (the only other modal in this codebase). */
export function ImportFromReportModal({
  currentVersion,
  currentMeta,
  onApply,
  onClose,
}: {
  currentVersion: CvssVersion;
  currentMeta: CvssMeta;
  onApply: (payload: ReportImportApplyPayload) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const [text, setText] = useState("");
  const [detection, setDetection] = useState<CvssReportImportDetection | null>(null);
  const [selected, setSelected] = useState<Record<SingleFieldKey, boolean>>({
    title: true,
    description: true,
    impact: true,
    notes: true,
    cwe: true,
    owasp: true,
  });
  const [vectorSelected, setVectorSelected] = useState(true);
  const [selectedRefUrls, setSelectedRefUrls] = useState<Set<string>>(new Set());

  useEffect(() => setMounted(true), []);
  useFocusTrap(dialogRef, mounted, onClose);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const hasAnyDetection = useMemo(() => {
    if (!detection) return false;
    return (
      detection.vector.detected !== null ||
      detection.title !== null ||
      detection.description !== null ||
      detection.impact !== null ||
      detection.notes !== null ||
      detection.cwe !== null ||
      detection.owasp !== null ||
      detection.references.length > 0
    );
  }, [detection]);

  function runDetection() {
    const result = detectCvssFieldsFromReport(text);
    setDetection(result);
    setSelected({
      title: result.title !== null,
      description: result.description !== null,
      impact: result.impact !== null,
      notes: result.notes !== null,
      cwe: result.cwe !== null,
      owasp: result.owasp !== null,
    });
    setVectorSelected(result.vector.detected !== null);
    setSelectedRefUrls(new Set(result.references.map((r) => r.url)));
  }

  function toggleRefUrl(url: string) {
    setSelectedRefUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function apply() {
    if (!detection) return;
    const metaPatch: Partial<CvssMeta> = {};
    if (selected.title && detection.title) metaPatch.title = detection.title;
    if (selected.description && detection.description) metaPatch.description = detection.description;
    if (selected.impact && detection.impact) metaPatch.impact = detection.impact;
    if (selected.notes && detection.notes) metaPatch.rationale = detection.notes;
    if (selected.cwe && detection.cwe) metaPatch.cweId = detection.cwe.id;
    if (selected.owasp && detection.owasp) metaPatch.owaspRefId = detection.owasp.id;

    const chosenRefs = detection.references.filter((r) => selectedRefUrls.has(r.url));
    if (chosenRefs.length > 0) {
      const existingUrls = new Set(currentMeta.references.map((r) => r.url));
      const newOnes = chosenRefs.filter((r) => !existingUrls.has(r.url));
      if (newOnes.length > 0) metaPatch.references = [...currentMeta.references, ...newOnes];
    }

    const payload: ReportImportApplyPayload = { metaPatch };
    if (vectorSelected && detection.vector.detected) {
      payload.version = detection.vector.detected.version;
      if (detection.vector.detected.version === "3.1") payload.metrics31 = detection.vector.detected.metrics as Cvss31Metrics;
      else payload.metrics40 = detection.vector.detected.metrics as Cvss40Metrics;
    }

    onApply(payload);
    onClose();
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl rounded border border-zinc-300 bg-white p-6 shadow-xl outline-none dark:border-zinc-700 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={headingId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Import From Report
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Paste a finding from your own report below (title, description, impact, CVSS vector, CWE, OWASP category, references,
            whatever you have). This runs entirely in your browser and is never sent anywhere. Nothing is applied until you review the
            detected fields and click Apply.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Paste report text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={"Title: Reflected XSS in search parameter\nDescription: ...\nImpact: ...\nCVSS:3.1/AV:N/AC:L/...\nCWE-79\nA03:2021 - Injection"}
              className={`${inputClasses} font-sans`}
            />
            <button type="button" onClick={runDetection} disabled={text.trim().length === 0} className={`${iconButtonClasses} mt-2`}>
              Detect
            </button>
          </div>

          {detection && !hasAnyDetection && <Callout variant="warning">Nothing recognizable was detected in that text. You can still close this and fill in the form manually.</Callout>}

          {detection && hasAnyDetection && (
            <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
              {detection.vector.multipleFound && (
                <Callout variant="info">Found more than one CVSS vector in this text. Only the first one was used.</Callout>
              )}

              <DetectionRow
                label="CVSS Vector"
                detected={detection.vector.detected?.vector ?? null}
                current={null}
                checked={vectorSelected}
                onToggle={() => setVectorSelected((v) => !v)}
                note={detection.vector.detected && detection.vector.detected.version !== currentVersion ? `Applying will switch the calculator to CVSS ${detection.vector.detected.version}.` : undefined}
              />
              <DetectionRow
                label="Title"
                detected={detection.title}
                current={currentMeta.title || null}
                checked={selected.title}
                onToggle={() => setSelected((s) => ({ ...s, title: !s.title }))}
              />
              <DetectionRow
                label="Description"
                detected={detection.description}
                current={currentMeta.description || null}
                checked={selected.description}
                onToggle={() => setSelected((s) => ({ ...s, description: !s.description }))}
              />
              <DetectionRow
                label="Impact"
                detected={detection.impact}
                current={currentMeta.impact || null}
                checked={selected.impact}
                onToggle={() => setSelected((s) => ({ ...s, impact: !s.impact }))}
              />
              <DetectionRow
                label="Notes / Rationale"
                detected={detection.notes}
                current={currentMeta.rationale || null}
                checked={selected.notes}
                onToggle={() => setSelected((s) => ({ ...s, notes: !s.notes }))}
              />
              <DetectionRow
                label="CWE"
                detected={detection.cwe ? `${detection.cwe.id}: ${detection.cwe.label}` : null}
                current={currentMeta.cweId}
                checked={selected.cwe}
                onToggle={() => setSelected((s) => ({ ...s, cwe: !s.cwe }))}
              />
              <DetectionRow
                label="OWASP Category"
                detected={detection.owasp?.label ?? null}
                current={currentMeta.owaspRefId}
                checked={selected.owasp}
                onToggle={() => setSelected((s) => ({ ...s, owasp: !s.owasp }))}
              />

              <div>
                <div className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-500">References</div>
                {detection.references.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Not detected — fill in manually.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {detection.references.map((r) => (
                      <label key={r.url} className={checkboxLabelClasses}>
                        <input type="checkbox" checked={selectedRefUrls.has(r.url)} onChange={() => toggleRefUrl(r.url)} />
                        <span className="truncate font-mono text-xs">{r.url}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={iconButtonClasses}>
            Cancel
          </button>
          <button type="button" onClick={apply} disabled={!hasAnyDetection} className={iconButtonClasses}>
            Apply Selected
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DetectionRow({
  label,
  detected,
  current,
  checked,
  onToggle,
  note,
}: {
  label: string;
  detected: string | null;
  current: string | null;
  checked: boolean;
  onToggle: () => void;
  note?: string;
}) {
  if (detected === null) {
    return (
      <div className="flex items-center gap-2 opacity-60">
        <input type="checkbox" checked={false} disabled />
        <span className="text-sm text-zinc-500 dark:text-zinc-500">
          <span className="font-medium">{label}:</span> Not detected — fill in manually.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <label className={checkboxLabelClasses}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <span className="font-medium">{label}:</span>
        <span className="min-w-0 flex-1 truncate">{detected}</span>
      </label>
      {current && current.trim() !== "" && current !== detected && (
        <p className="ml-6 truncate text-xs text-zinc-400 dark:text-zinc-500">Current: {current}</p>
      )}
      {note && <p className="ml-6 text-xs text-amber-600 dark:text-amber-400">{note}</p>}
    </div>
  );
}
