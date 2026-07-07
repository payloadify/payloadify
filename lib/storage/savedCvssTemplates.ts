"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CvssMeta } from "@/lib/cvss/templates/types";
import { Platform } from "@/lib/cvss/shared/types";
import { Cvss31Metrics } from "@/lib/cvss/v3_1/metrics";
import { Cvss40Metrics } from "@/lib/cvss/v4_0/metrics";

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

function isSavedCvssTemplate(value: unknown): value is SavedCvssTemplate {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.platformFilter === "string" &&
    (typeof v.vulnTypeId === "string" || v.vulnTypeId === null) &&
    typeof v.cvss31 === "object" &&
    v.cvss31 !== null &&
    typeof v.cvss40 === "object" &&
    v.cvss40 !== null &&
    typeof v.meta === "object" &&
    v.meta !== null
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
      const next = [template, ...loadSavedCvssTemplates(key)].slice(0, MAX_SAVED_CVSS_TEMPLATES);
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
