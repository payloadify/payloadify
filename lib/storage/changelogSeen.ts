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

// Keeps the "new" dot in sync across tabs — without this, marking the changelog as seen in one
// tab wouldn't clear the dot in another already-open tab until that tab's cache was invalidated
// some other way.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    snapshotCache = e.newValue;
    invalidate();
  });
}

// Sentinel for the pre-hydration render, distinct from a confirmed-empty localStorage read (null).
// Static export prerenders HTML with no localStorage access, so the server snapshot can't know the
// real "last seen" value. Treating that unknown state as "seen" (see useHasUnseenChangelog) means
// the dot never flashes on and then immediately off during hydration — it only ever appears once
// the real value is known, instead of appearing then vanishing.
const UNKNOWN = "unknown";

export function useChangelogLastSeen() {
  const lastSeen = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      subscribers.add(onStoreChange);
      return () => subscribers.delete(onStoreChange);
    }, []),
    getSnapshot,
    () => UNKNOWN,
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
  if (lastSeen === UNKNOWN) return false;
  return lastSeen === null || lastSeen < latestDate;
}
