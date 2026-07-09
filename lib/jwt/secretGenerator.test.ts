// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  generateHmacSecret,
  SECRET_BIT_PRESETS,
  SECRET_BITS_DEFAULT,
  SECRET_BITS_MAX,
  SECRET_BITS_MIN,
} from "./secretGenerator";

describe("SECRET_BIT_PRESETS", () => {
  it("every preset value is within the min/max range", () => {
    for (const bits of SECRET_BIT_PRESETS) {
      expect(bits).toBeGreaterThanOrEqual(SECRET_BITS_MIN);
      expect(bits).toBeLessThanOrEqual(SECRET_BITS_MAX);
    }
  });
});

describe("generateHmacSecret", () => {
  it("standard mode only uses alphanumeric characters", () => {
    const secret = generateHmacSecret(SECRET_BITS_DEFAULT, "standard");
    expect(secret).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("enhanced mode can include special characters (statistically, over a long secret)", () => {
    const secret = generateHmacSecret(SECRET_BITS_MAX, "enhanced");
    expect(secret).toMatch(/^[A-Za-z0-9!@#$%^&*()\-_=+[\]{}|;:,.<>?/~]+$/);
    // Not a hard guarantee any given run includes a special char, but over 512 bits of
    // entropy across a ~91-char alphabet the odds of zero special chars are astronomically
    // small — a real regression (e.g. charset not actually applied) would fail this reliably.
    expect(secret).toMatch(/[!@#$%^&*()\-_=+[\]{}|;:,.<>?/~]/);
  });

  it("produces enough characters to cover the requested bit strength", () => {
    for (const bits of [128, 192, 256, 384, 512]) {
      const standard = generateHmacSecret(bits, "standard");
      const enhanced = generateHmacSecret(bits, "enhanced");
      expect(standard.length).toBeGreaterThanOrEqual(Math.ceil(bits / Math.log2(62)));
      expect(enhanced.length).toBeGreaterThanOrEqual(Math.ceil(bits / Math.log2(91)));
    }
  });

  it("clamps below-minimum and above-maximum bit requests", () => {
    const tooLow = generateHmacSecret(1, "standard");
    const tooHigh = generateHmacSecret(10000, "standard");
    expect(tooLow.length).toBe(Math.ceil(SECRET_BITS_MIN / Math.log2(62)));
    expect(tooHigh.length).toBe(Math.ceil(SECRET_BITS_MAX / Math.log2(62)));
  });

  it("produces different secrets on successive calls", () => {
    const a = generateHmacSecret(256, "standard");
    const b = generateHmacSecret(256, "standard");
    expect(a).not.toBe(b);
  });

  it("has a roughly uniform character distribution over a large sample (no obvious modulo bias)", () => {
    const counts = new Map<string, number>();
    const sampleSize = 20000;
    let combined = "";
    while (combined.length < sampleSize) combined += generateHmacSecret(512, "standard");
    combined = combined.slice(0, sampleSize);
    for (const ch of combined) counts.set(ch, (counts.get(ch) ?? 0) + 1);

    const expected = sampleSize / 62;
    for (const count of counts.values()) {
      // Loose bound (±40%) — this is a smoke test for gross bias, not a rigorous statistical test.
      expect(count).toBeGreaterThan(expected * 0.6);
      expect(count).toBeLessThan(expected * 1.4);
    }
  });
});
