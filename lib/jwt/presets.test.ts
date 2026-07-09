import { describe, expect, it } from "vitest";
import { getPreset, JWT_PRESETS } from "./presets";

describe("JWT_PRESETS", () => {
  it("every preset has a unique id", () => {
    const ids = JWT_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every preset's built header alg matches its declared alg", () => {
    for (const preset of JWT_PRESETS) {
      expect(preset.buildHeader().alg).toBe(preset.alg);
    }
  });

  it("presets build fresh timestamps relative to the given 'now', not baked constants", () => {
    const now1 = 1700000000;
    const now2 = 1800000000;
    for (const preset of JWT_PRESETS) {
      const payload1 = preset.buildPayload(now1);
      const payload2 = preset.buildPayload(now2);
      if ("iat" in payload1) {
        expect(payload1.iat).not.toBe(payload2.iat);
      }
    }
  });

  it("the expired preset's exp is before 'now'", () => {
    const now = 1700000000;
    const payload = getPreset("expired")!.buildPayload(now);
    expect(payload.exp as number).toBeLessThan(now);
  });

  it("the missing-exp preset has no exp claim", () => {
    const payload = getPreset("missing-exp")!.buildPayload(1700000000);
    expect("exp" in payload).toBe(false);
  });

  it("getPreset returns undefined for an unknown id", () => {
    expect(getPreset("does-not-exist")).toBeUndefined();
  });
});
