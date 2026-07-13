"use client";

import { useState } from "react";
import { canGenerate, pruneHistory } from "@/lib/rateLimit/rateLimit";
import { loadHistory, saveHistory } from "@/lib/storage/generationHistory";

export type RateLimitCheck = { allowed: true; now: number } | { allowed: false };

/** Shared client-side rate-limit wiring for the payload generator tools (XSS, SQLi, reverse
 *  shell, MSFVenom, subdomain permutation). `checkAndClear` only checks the limit and sets/clears
 *  the blocked message — it does NOT record a generation. Call `recordGeneration` yourself at
 *  whatever point in your generate() function should count against the limit: most tools count
 *  immediately once allowed, but e.g. SQLi only counts a *successful* generation (an unsupported
 *  dialect/level/context combo shouldn't burn the user's cooldown) — call it from inside that
 *  success path instead. `setBlockedMsg` is exposed raw so a tool can clear it on reset, or (like
 *  SQLi) reuse the same banner for a non-rate-limit failure message. */
export function useRateLimitedGeneration(historyKey: string) {
  // localStorage doesn't exist during the static-export prerender, so this initializer only
  // reads real history once hydrated client-side.
  const [history, setHistory] = useState<number[]>(() =>
    typeof window === "undefined" ? [] : pruneHistory(loadHistory(historyKey), Date.now()),
  );
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  function checkAndClear(): RateLimitCheck {
    const now = Date.now();
    const check = canGenerate(history, now);
    if (!check.allowed) {
      setBlockedMsg(`Rate limited — try again in ${Math.ceil(check.retryAfterMs / 1000)}s.`);
      return { allowed: false };
    }
    setBlockedMsg(null);
    return { allowed: true, now };
  }

  function recordGeneration(now: number) {
    const nextHistory = [...pruneHistory(history, now), now];
    setHistory(nextHistory);
    saveHistory(historyKey, nextHistory);
  }

  return { blockedMsg, setBlockedMsg, checkAndClear, recordGeneration };
}
