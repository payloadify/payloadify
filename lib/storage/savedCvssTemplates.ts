"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CvssMeta, CvssReference } from "../cvss/templates/types";
import { PLATFORMS, Platform } from "../cvss/shared/types";
import {
  Cvss31Metrics,
  CVSS31_AC_OPTIONS,
  CVSS31_AV_OPTIONS,
  CVSS31_CIA_OPTIONS,
  CVSS31_PR_OPTIONS,
  CVSS31_S_OPTIONS,
  CVSS31_UI_OPTIONS,
} from "../cvss/v3_1/metrics";
import {
  Cvss40Metrics,
  CVSS40_AC_OPTIONS,
  CVSS40_AT_OPTIONS,
  CVSS40_AV_OPTIONS,
  CVSS40_E_OPTIONS,
  CVSS40_IMPACT_OPTIONS,
  CVSS40_PR_OPTIONS,
  CVSS40_UI_OPTIONS,
} from "../cvss/v4_0/metrics";

/** localStorage-backed persistence for user-named custom CVSS scores in the CVSS calculator —
 *  mirrors the "Saved Listeners" pattern in savedListeners.ts, scoped to this feature's shape. */

export interface SavedCvssTemplate {
  id: string;
  name: string;
  platformFilter: Platform;
  vulnTypeId: string | null;
  cvss31: Cvss31Metrics;
  cvss40: Cvss40Metrics;
  meta: CvssMeta;
}

export const MAX_SAVED_CVSS_TEMPLATES = 50;

/** Checks `value` is a string matching one of `options`' ids — used to validate every CVSS
 *  metric enum below rather than just trusting `typeof === "string"`, since an out-of-range
 *  enum value (e.g. from a hand-edited or corrupted import file) silently produces a NaN base
 *  score that severityRating() then mislabels as "Critical" (NaN fails every `<` comparison). */
function isValidOption<T extends string>(value: unknown, options: { id: T }[]): value is T {
  return typeof value === "string" && options.some((o) => o.id === value);
}

function isValidCvss31Metrics(value: unknown): value is Cvss31Metrics {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isValidOption(v.AV, CVSS31_AV_OPTIONS) &&
    isValidOption(v.AC, CVSS31_AC_OPTIONS) &&
    isValidOption(v.PR, CVSS31_PR_OPTIONS) &&
    isValidOption(v.UI, CVSS31_UI_OPTIONS) &&
    isValidOption(v.S, CVSS31_S_OPTIONS) &&
    isValidOption(v.C, CVSS31_CIA_OPTIONS) &&
    isValidOption(v.I, CVSS31_CIA_OPTIONS) &&
    isValidOption(v.A, CVSS31_CIA_OPTIONS)
  );
}

function isValidCvss40Metrics(value: unknown): value is Cvss40Metrics {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isValidOption(v.AV, CVSS40_AV_OPTIONS) &&
    isValidOption(v.AC, CVSS40_AC_OPTIONS) &&
    isValidOption(v.AT, CVSS40_AT_OPTIONS) &&
    isValidOption(v.PR, CVSS40_PR_OPTIONS) &&
    isValidOption(v.UI, CVSS40_UI_OPTIONS) &&
    isValidOption(v.VC, CVSS40_IMPACT_OPTIONS) &&
    isValidOption(v.VI, CVSS40_IMPACT_OPTIONS) &&
    isValidOption(v.VA, CVSS40_IMPACT_OPTIONS) &&
    isValidOption(v.SC, CVSS40_IMPACT_OPTIONS) &&
    isValidOption(v.SI, CVSS40_IMPACT_OPTIONS) &&
    isValidOption(v.SA, CVSS40_IMPACT_OPTIONS) &&
    isValidOption(v.E, CVSS40_E_OPTIONS)
  );
}

function isValidCvssReference(value: unknown): value is CvssReference {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.label === "string" && typeof v.url === "string";
}

/** description/impact/chainedImpact are allowed to be `undefined` (not just the right type) —
 *  they were added after this feature originally shipped, so templates saved to a user's
 *  localStorage by an older build won't have them at all. CvssCalculatorTool spreads over
 *  EMPTY_CVSS_META on load, which fills the missing keys with "" — rejecting them here would
 *  silently drop pre-existing saved templates for anyone upgrading. Every other field predates
 *  this feature and must always be present. */
function isValidCvssMeta(value: unknown): value is CvssMeta {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.rationale === "string" &&
    (v.owaspRefId === null || typeof v.owaspRefId === "string") &&
    (v.vrtRefId === null || typeof v.vrtRefId === "string") &&
    (v.cweId === null || typeof v.cweId === "string") &&
    Array.isArray(v.references) &&
    v.references.every(isValidCvssReference) &&
    (v.description === undefined || typeof v.description === "string") &&
    (v.impact === undefined || typeof v.impact === "string") &&
    (v.chainedImpact === undefined || typeof v.chainedImpact === "string")
  );
}

function isSavedCvssTemplate(value: unknown): value is SavedCvssTemplate {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    isValidOption(v.platformFilter, PLATFORMS) &&
    (typeof v.vulnTypeId === "string" || v.vulnTypeId === null) &&
    isValidCvss31Metrics(v.cvss31) &&
    isValidCvss40Metrics(v.cvss40) &&
    isValidCvssMeta(v.meta)
  );
}

export type ImportSavedCvssTemplatesResult = { templates: SavedCvssTemplate[]; skippedInvalid: number } | { error: string };

/** Parses a previously-exported templates JSON file back into validated SavedCvssTemplate[].
 *  Never throws — every malformed/incompatible shape resolves to a user-facing `error` string
 *  instead of a crash, per the "never silently drop or crash on import" requirement. */
export function parseSavedCvssTemplatesImport(raw: string): ImportSavedCvssTemplatesResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "That file isn't valid JSON." };
  }
  if (!Array.isArray(parsed)) {
    return { error: "That file doesn't look like a Payloadify CVSS templates export (expected a list of templates)." };
  }
  if (parsed.length === 0) {
    return { error: "That file has no templates to import." };
  }
  const templates = parsed.filter(isSavedCvssTemplate);
  if (templates.length === 0) {
    return { error: "None of the entries in that file were valid CVSS templates." };
  }
  return { templates, skippedInvalid: parsed.length - templates.length };
}

export function loadSavedCvssTemplates(key: string): SavedCvssTemplate[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedCvssTemplate) : [];
  } catch {
    return [];
  }
}

export function saveSavedCvssTemplates(key: string, templates: SavedCvssTemplate[]) {
  try {
    localStorage.setItem(key, JSON.stringify(templates.slice(0, MAX_SAVED_CVSS_TEMPLATES)));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — feature just doesn't persist
    // for this tab session, an acceptable degradation (matches savedListeners.ts).
  }
}

/** Pure merge-planning for Import: existing templates keep priority for the 50-item cap, and any
 *  incoming template whose id already exists is skipped (re-importing the same export file is a
 *  no-op, not a duplicate). Split out from the hook below so the cap/dedup arithmetic — the part
 *  most worth getting right for "never silently drop data" — is unit-testable without React. */
export function mergeImportedCvssTemplates(existing: SavedCvssTemplate[], incoming: SavedCvssTemplate[]) {
  const existingIds = new Set(existing.map((t) => t.id));
  const newOnes = incoming.filter((t) => !existingIds.has(t.id));
  const duplicates = incoming.length - newOnes.length;
  const kept = [...existing, ...newOnes].slice(0, MAX_SAVED_CVSS_TEMPLATES);
  const added = kept.length - existing.length;
  const skippedForCap = newOnes.length - added;
  return { kept, added, skippedForCap, duplicates };
}

const EMPTY_SNAPSHOT: SavedCvssTemplate[] = [];
const snapshotCache = new Map<string, SavedCvssTemplate[]>();
const subscribers = new Map<string, Set<() => void>>();

function getSnapshot(key: string): SavedCvssTemplate[] {
  if (!snapshotCache.has(key)) snapshotCache.set(key, loadSavedCvssTemplates(key));
  return snapshotCache.get(key)!;
}

function invalidate(key: string) {
  snapshotCache.delete(key);
  subscribers.get(key)?.forEach((notify) => notify());
}

export function useSavedCvssTemplates(key: string) {
  const templates = useSyncExternalStore(
    useCallback(
      (onStoreChange: () => void) => {
        if (!subscribers.has(key)) subscribers.set(key, new Set());
        const set = subscribers.get(key)!;
        set.add(onStoreChange);
        return () => set.delete(onStoreChange);
      },
      [key],
    ),
    () => getSnapshot(key),
    () => EMPTY_SNAPSHOT,
  );

  const save = useCallback(
    (template: SavedCvssTemplate) => {
      // Dedupe by id so re-saving an existing template (explicit overwrite) replaces it in
      // place instead of appending a second entry — see saveCurrentAsTemplate's name-collision
      // confirm in CvssCalculatorTool.tsx.
      const next = [template, ...loadSavedCvssTemplates(key).filter((t) => t.id !== template.id)].slice(0, MAX_SAVED_CVSS_TEMPLATES);
      saveSavedCvssTemplates(key, next);
      invalidate(key);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const next = loadSavedCvssTemplates(key).filter((t) => t.id !== id);
      saveSavedCvssTemplates(key, next);
      invalidate(key);
    },
    [key],
  );

  const removeAll = useCallback(() => {
    saveSavedCvssTemplates(key, []);
    invalidate(key);
  }, [key]);

  const importMany = useCallback(
    (incoming: SavedCvssTemplate[]) => {
      const { kept, added, skippedForCap, duplicates } = mergeImportedCvssTemplates(loadSavedCvssTemplates(key), incoming);
      saveSavedCvssTemplates(key, kept);
      invalidate(key);
      return { added, skippedForCap, duplicates };
    },
    [key],
  );

  return { templates, save, remove, removeAll, importMany };
}
