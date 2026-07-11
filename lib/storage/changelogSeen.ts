"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Persists the ISO date of the last changelog entry the visitor has seen, so the footer trigger
 *  can show a "new" dot. Mirrors the useSyncExternalStore pattern in persistedBoolean.ts, but
 *  stores a date string rather than a boolean — that way "is there anything new" self-heals when
 *  new entries are added later, instead of a boolean someone has to remember to flip. */

const STORAGE_KEY = "payloadify:changelog-last-seen";

function readLastSeen(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLastSeen(date: string) {
  try {
    localStorage.setItem(STORAGE_KEY, date);
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — the "new" dot just won't
    // persist across visits, an acceptable degradation (matches persistedBoolean.ts).
  }
}

let snapshotCache: string | null | undefined;
const subscribers = new Set<() => void>();

function getSnapshot(): string | null {
  if (snapshotCache === undefined) snapshotCache = readLastSeen();
  return snapshotCache;
}

function invalidate() {
  subscribers.forEach((notify) => notify());
}

export function useChangelogLastSeen() {
  const lastSeen = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      subscribers.add(onStoreChange);
      return () => subscribers.delete(onStoreChange);
    }, []),
    getSnapshot,
    () => null,
  );

  const markSeen = useCallback((date: string) => {
    snapshotCache = date;
    writeLastSeen(date);
    invalidate();
  }, []);

  return [lastSeen, markSeen] as const;
}

/** ISO "YYYY-MM-DD" strings compare correctly with `<` lexically — no Date parsing needed. */
export function useHasUnseenChangelog(latestDate: string): boolean {
  const [lastSeen] = useChangelogLastSeen();
  return lastSeen === null || lastSeen < latestDate;
}
