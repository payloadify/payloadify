"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CopyStyle } from "@/lib/copyFormat";

/** localStorage-backed persistence for the Security Headers Analyzer's "Copy All" panel settings.
 *  Mirrors lib/storage/cvssCopyAllSettings.ts's useSyncExternalStore pattern exactly, but is its
 *  own separate module (own storage key, own hook) rather than a shared one — matching the
 *  established per-tool-copy-settings precedent (cvssCopyAllSettings.ts / jwtCopyAllSettings.ts
 *  are likewise not shared with each other). */

export interface SecurityHeadersCopyAllSettings {
  order: string[];
  excludedIds: string[];
  urlFieldIds: string[];
  styleKind: CopyStyle["kind"];
  customPrefix: string;
}

const STORAGE_KEY = "payloadify:security-headers-analyzer:copy-all-settings";

const DEFAULT_SETTINGS: SecurityHeadersCopyAllSettings = {
  order: [],
  excludedIds: [],
  urlFieldIds: [],
  styleKind: "none",
  customPrefix: "- ",
};

function isValidSettings(value: unknown): value is SecurityHeadersCopyAllSettings {
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

function readSettings(): SecurityHeadersCopyAllSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings: SecurityHeadersCopyAllSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — preference just doesn't
    // persist for this tab session, an acceptable degradation (matches savedListeners.ts).
  }
}

let cache: SecurityHeadersCopyAllSettings | null = null;
const subscribers = new Set<() => void>();

function getSnapshot(): SecurityHeadersCopyAllSettings {
  if (!cache) cache = readSettings();
  return cache;
}

function invalidate() {
  subscribers.forEach((notify) => notify());
}

export function useSecurityHeadersCopyAllSettings() {
  const settings = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      subscribers.add(onStoreChange);
      return () => subscribers.delete(onStoreChange);
    }, []),
    getSnapshot,
    () => DEFAULT_SETTINGS,
  );

  const update = useCallback((patch: Partial<SecurityHeadersCopyAllSettings>) => {
    cache = { ...getSnapshot(), ...patch };
    writeSettings(cache);
    invalidate();
  }, []);

  return [settings, update] as const;
}
