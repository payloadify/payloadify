/** Cross-origin redirect hops we'll follow before giving up (per-target, not per-request). */
export const MAX_REDIRECTS = 5;

/** Abort an outbound fetch that hangs this long — keeps a slow/hostile target from tying up the Worker. */
export const FETCH_TIMEOUT_MS = 10_000;

/** How long a successful lookup is cached (Workers Cache API), per ANALYZER-SPECS.md's 5–10 min guidance. */
export const CACHE_TTL_SECONDS = 300;
