"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CopyStyle } from "@payloadify/cvss-core";

/** localStorage-backed persistence for the JWT Generator's "Copy All" panel settings — field
 *  order, which fields are included, which fields use their URL form, and the list
 *  style/prefix. Modeled on lib/storage/cvssCopyAllSettings.ts's useSyncExternalStore
 *  pattern (a separate, JWT-specific copy, not a shared import — see the implementation
 *  plan for why). Only ordering/style preferences are persisted here — never the actual
 *  secret/PEM/token values, which must never be written to localStorage. */

export interface JwtCopyAllSettings {
  order: string[];
  excludedIds: string[];
  urlFieldIds: string[];
  styleKind: CopyStyle["kind"];
  customPrefix: string;
}

const STORAGE_KEY = "payloadify:jwt-generator:copy-all-settings";

const DEFAULT_SETTINGS: JwtCopyAllSettings = {
  order: [],
  excludedIds: [],
  urlFieldIds: [],
  styleKind: "none",
  customPrefix: "- ",
};

function isValidSettings(value: unknown): value is JwtCopyAllSettings {
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

function readSettings(): JwtCopyAllSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings: JwtCopyAllSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — preference just doesn't
    // persist for this tab session, an acceptable degradation.
  }
}

let cache: JwtCopyAllSettings | null = null;
const subscribers = new Set<() => void>();

function getSnapshot(): JwtCopyAllSettings {
  if (!cache) cache = readSettings();
  return cache;
}

function invalidate() {
  subscribers.forEach((notify) => notify());
}

export function useJwtCopyAllSettings() {
  const settings = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      subscribers.add(onStoreChange);
      return () => subscribers.delete(onStoreChange);
    }, []),
    getSnapshot,
    () => DEFAULT_SETTINGS,
  );

  const update = useCallback((patch: Partial<JwtCopyAllSettings>) => {
    cache = { ...getSnapshot(), ...patch };
    writeSettings(cache);
    invalidate();
  }, []);

  return [settings, update] as const;
}
