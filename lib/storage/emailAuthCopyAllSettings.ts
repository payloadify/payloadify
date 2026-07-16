"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CopyStyle } from "@/lib/copyFormat";

/** localStorage-backed persistence for the SPF/DKIM/DMARC Checker's "Copy All" panel settings.
 *  Mirrors lib/storage/securityHeadersCopyAllSettings.ts's useSyncExternalStore pattern exactly,
 *  as its own separate module (own storage key, own hook) per the established per-tool precedent. */

export interface EmailAuthCopyAllSettings {
  order: string[];
  excludedIds: string[];
  urlFieldIds: string[];
  styleKind: CopyStyle["kind"];
  customPrefix: string;
}

const STORAGE_KEY = "payloadify:spf-dkim-dmarc-checker:copy-all-settings";

const DEFAULT_SETTINGS: EmailAuthCopyAllSettings = {
  order: [],
  excludedIds: [],
  urlFieldIds: [],
  styleKind: "none",
  customPrefix: "- ",
};

function isValidSettings(value: unknown): value is EmailAuthCopyAllSettings {
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

function readSettings(): EmailAuthCopyAllSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings: EmailAuthCopyAllSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — preference just doesn't
    // persist for this tab session, an acceptable degradation (matches savedListeners.ts).
  }
}

let cache: EmailAuthCopyAllSettings | null = null;
const subscribers = new Set<() => void>();

function getSnapshot(): EmailAuthCopyAllSettings {
  if (!cache) cache = readSettings();
  return cache;
}

function invalidate() {
  subscribers.forEach((notify) => notify());
}

export function useEmailAuthCopyAllSettings() {
  const settings = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      subscribers.add(onStoreChange);
      return () => subscribers.delete(onStoreChange);
    }, []),
    getSnapshot,
    () => DEFAULT_SETTINGS,
  );

  const update = useCallback((patch: Partial<EmailAuthCopyAllSettings>) => {
    cache = { ...getSnapshot(), ...patch };
    writeSettings(cache);
    invalidate();
  }, []);

  return [settings, update] as const;
}
