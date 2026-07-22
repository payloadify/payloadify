"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CopyStyle } from "@payloadify/cvss-core";

/** localStorage-backed persistence for the CVSS calculator's "Copy All" panel settings —
 *  field order, which fields are included, which fields use their URL form, and the list
 *  style/prefix. Field ids ("vector", "owasp", "vrt", "cwe", "references") are a fixed, small
 *  namespace independent of which template/chain is active, so persisting by id generalizes
 *  across sessions. Mirrors the useSyncExternalStore pattern in savedListeners.ts. */

export interface CvssCopyAllSettings {
  order: string[];
  excludedIds: string[];
  urlFieldIds: string[];
  styleKind: CopyStyle["kind"];
  customPrefix: string;
  /** Whether each field's own label (e.g. "Title:", "Description:") is prepended in the Copy
   *  All output. Defaults on; toggled off via the "Labels" button beside "Wrap". */
  labelsEnabled: boolean;
}

const STORAGE_KEY = "payloadify:cvss-calculator:copy-all-settings";

const DEFAULT_SETTINGS: CvssCopyAllSettings = {
  order: [],
  excludedIds: [],
  urlFieldIds: [],
  styleKind: "none",
  customPrefix: "- ",
  labelsEnabled: true,
};

function isValidSettings(value: unknown): value is CvssCopyAllSettings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.order) &&
    Array.isArray(v.excludedIds) &&
    Array.isArray(v.urlFieldIds) &&
    typeof v.styleKind === "string" &&
    typeof v.customPrefix === "string"
  );
}

function readSettings(): CvssCopyAllSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Spread over defaults so settings saved before `labelsEnabled` existed still load with a
    // defined value instead of undefined (same reasoning as saved-CVSS-template loading).
    return isValidSettings(parsed) ? { ...DEFAULT_SETTINGS, ...parsed } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings: CvssCopyAllSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — preference just doesn't
    // persist for this tab session, an acceptable degradation (matches savedListeners.ts).
  }
}

let cache: CvssCopyAllSettings | null = null;
const subscribers = new Set<() => void>();

function getSnapshot(): CvssCopyAllSettings {
  if (!cache) cache = readSettings();
  return cache;
}

function invalidate() {
  subscribers.forEach((notify) => notify());
}

export function useCvssCopyAllSettings() {
  const settings = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      subscribers.add(onStoreChange);
      return () => subscribers.delete(onStoreChange);
    }, []),
    getSnapshot,
    () => DEFAULT_SETTINGS,
  );

  const update = useCallback((patch: Partial<CvssCopyAllSettings>) => {
    cache = { ...getSnapshot(), ...patch };
    writeSettings(cache);
    invalidate();
  }, []);

  return [settings, update] as const;
}
