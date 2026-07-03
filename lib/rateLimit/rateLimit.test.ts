import { describe, expect, it } from "vitest";
import { canGenerate, pruneHistory, COOLDOWN_MS, WINDOW_MS, MAX_PER_WINDOW } from "./rateLimit";

describe("canGenerate", () => {
  it("allows the first generation with empty history", () => {
    expect(canGenerate([], 0)).toEqual({ allowed: true });
  });

  it("blocks a second generation before the cooldown elapses", () => {
    const result = canGenerate([1000], 1000 + COOLDOWN_MS - 1);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.retryAfterMs).toBe(1);
  });

  it("allows a generation once the cooldown has fully elapsed", () => {
    expect(canGenerate([1000], 1000 + COOLDOWN_MS)).toEqual({ allowed: true });
  });

  it("blocks once the rolling window cap is hit even after cooldown elapses", () => {
    const now = 100_000;
    const history = Array.from({ length: MAX_PER_WINDOW }, (_, i) => now - i * (COOLDOWN_MS + 10));
    const result = canGenerate(history, now);
    expect(result.allowed).toBe(false);
  });

  it("allows generation again after the window fully rolls over", () => {
    const now = 100_000;
    const history = [now - WINDOW_MS - 1];
    expect(canGenerate(history, now)).toEqual({ allowed: true });
  });
});

describe("pruneHistory", () => {
  it("drops timestamps older than the rolling window", () => {
    const now = 100_000;
    const history = [now - WINDOW_MS - 1, now - 100];
    expect(pruneHistory(history, now)).toEqual([now - 100]);
  });
});
