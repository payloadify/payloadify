export const COOLDOWN_MS = 1500;
export const WINDOW_MS = 60_000;
export const MAX_PER_WINDOW = 20;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

/** Pure decision function — takes the existing generation timestamps (ms) and "now", and says
 *  whether a new generation is allowed. Enforces both a short per-click cooldown (deters
 *  button-mashing/simple click scripts) and a rolling per-minute cap (deters bulk automation
 *  across a longer window). Does not mutate `history` — callers append `now` themselves on success. */
export function canGenerate(history: number[], now: number): RateLimitResult {
  const recent = history.filter((t) => now - t < WINDOW_MS);

  const last = recent.length > 0 ? Math.max(...recent) : undefined;
  if (last !== undefined && now - last < COOLDOWN_MS) {
    return { allowed: false, retryAfterMs: COOLDOWN_MS - (now - last) };
  }

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = Math.min(...recent);
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }

  return { allowed: true };
}

/** Drops timestamps outside the rolling window — call before persisting so localStorage
 *  doesn't grow unbounded across a long browsing session. */
export function pruneHistory(history: number[], now: number): number[] {
  return history.filter((t) => now - t < WINDOW_MS);
}
