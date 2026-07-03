"use client";

import { useCallback, useSyncExternalStore } from "react";

/** localStorage-backed persistence for the "Saved Listeners" feature (msfvenom generator's
 *  LHOST/LPORT pair shortcuts). Scoped to this feature's shape — generationHistory.ts's helper
 *  is typed to number[] rate-limit timestamps and isn't reusable here. */

export interface SavedListener {
  id: string;
  label: string;
  lhost: string;
  lport: number;
}

export const MAX_SAVED_LISTENERS = 20;

function isSavedListener(value: unknown): value is SavedListener {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.label === "string" && typeof v.lhost === "string" && typeof v.lport === "number";
}

export function loadSavedListeners(key: string): SavedListener[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedListener) : [];
  } catch {
    return [];
  }
}

export function saveSavedListeners(key: string, listeners: SavedListener[]) {
  try {
    localStorage.setItem(key, JSON.stringify(listeners.slice(0, MAX_SAVED_LISTENERS)));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — feature just doesn't persist
    // for this tab session, an acceptable degradation (matches generationHistory.ts).
  }
}

const EMPTY_SNAPSHOT: SavedListener[] = [];
const snapshotCache = new Map<string, SavedListener[]>();
const subscribers = new Map<string, Set<() => void>>();

function getSnapshot(key: string): SavedListener[] {
  if (!snapshotCache.has(key)) snapshotCache.set(key, loadSavedListeners(key));
  return snapshotCache.get(key)!;
}

function invalidate(key: string) {
  snapshotCache.delete(key);
  subscribers.get(key)?.forEach((notify) => notify());
}

/** Reads/writes the saved-listener list via useSyncExternalStore rather than a lazy useState
 *  initializer + useEffect — this is the pattern React recommends for external browser-only
 *  storage: getServerSnapshot always returns [] (matching what the server renders), so hydration
 *  never mismatches, and React itself reconciles the real client snapshot after mount instead of
 *  a manual setState-in-effect. */
export function useSavedListeners(key: string) {
  const listeners = useSyncExternalStore(
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
    (listener: SavedListener) => {
      const next = [listener, ...loadSavedListeners(key)].slice(0, MAX_SAVED_LISTENERS);
      saveSavedListeners(key, next);
      invalidate(key);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const next = loadSavedListeners(key).filter((l) => l.id !== id);
      saveSavedListeners(key, next);
      invalidate(key);
    },
    [key],
  );

  const removeAll = useCallback(() => {
    saveSavedListeners(key, []);
    invalidate(key);
  }, [key]);

  const update = useCallback(
    (id: string, patch: Omit<SavedListener, "id">) => {
      const next = loadSavedListeners(key).map((l) => (l.id === id ? { ...l, ...patch } : l));
      saveSavedListeners(key, next);
      invalidate(key);
    },
    [key],
  );

  return { listeners, save, remove, removeAll, update };
}
