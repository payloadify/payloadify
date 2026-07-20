"use client";

import { useCallback, useSyncExternalStore } from "react";

/** localStorage-backed persistence for the Hashcat Command Builder's "Saved wordlists" feature —
 *  mirrors lib/storage/savedListeners.ts's shape/pattern exactly, but scoped to {id, label, path}
 *  since a wordlist shortcut has no equivalent to a listener's lhost/lport pair. */

export interface SavedWordlist {
  id: string;
  label: string;
  path: string;
}

export const MAX_SAVED_WORDLISTS = 20;

function isSavedWordlist(value: unknown): value is SavedWordlist {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.label === "string" && typeof v.path === "string";
}

export function loadSavedWordlists(key: string): SavedWordlist[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedWordlist) : [];
  } catch {
    return [];
  }
}

export function saveSavedWordlists(key: string, wordlists: SavedWordlist[]) {
  try {
    localStorage.setItem(key, JSON.stringify(wordlists.slice(0, MAX_SAVED_WORDLISTS)));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — feature just doesn't persist
    // for this tab session, an acceptable degradation (matches savedListeners.ts).
  }
}

const EMPTY_SNAPSHOT: SavedWordlist[] = [];
const snapshotCache = new Map<string, SavedWordlist[]>();
const subscribers = new Map<string, Set<() => void>>();

function getSnapshot(key: string): SavedWordlist[] {
  if (!snapshotCache.has(key)) snapshotCache.set(key, loadSavedWordlists(key));
  return snapshotCache.get(key)!;
}

function invalidate(key: string) {
  snapshotCache.delete(key);
  subscribers.get(key)?.forEach((notify) => notify());
}

/** Same useSyncExternalStore rationale as useSavedListeners: getServerSnapshot always returns
 *  [] (matching the server-rendered HTML), so hydration can't mismatch. */
export function useSavedWordlists(key: string) {
  const wordlists = useSyncExternalStore(
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
    (wordlist: SavedWordlist) => {
      const next = [wordlist, ...loadSavedWordlists(key)].slice(0, MAX_SAVED_WORDLISTS);
      saveSavedWordlists(key, next);
      invalidate(key);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      const next = loadSavedWordlists(key).filter((w) => w.id !== id);
      saveSavedWordlists(key, next);
      invalidate(key);
    },
    [key],
  );

  const removeAll = useCallback(() => {
    saveSavedWordlists(key, []);
    invalidate(key);
  }, [key]);

  return { wordlists, save, remove, removeAll };
}
