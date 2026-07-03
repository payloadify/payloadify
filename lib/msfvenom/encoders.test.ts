import { describe, expect, it } from "vitest";
import { MSFVENOM_ENCODERS, MSFVENOM_ENCODERS_BY_ID, NONE_ENCODER } from "./encoders";

describe("MSFVENOM_ENCODERS", () => {
  it("has unique ids and includes the none sentinel", () => {
    const ids = MSFVENOM_ENCODERS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("none");
    expect(MSFVENOM_ENCODERS_BY_ID.none).toBe(NONE_ENCODER);
  });

  it("gives the none encoder maxIterations of 0 and every real encoder a positive maxIterations", () => {
    expect(NONE_ENCODER.maxIterations).toBe(0);
    for (const e of MSFVENOM_ENCODERS) {
      if (e.id !== "none") expect(e.maxIterations).toBeGreaterThan(0);
    }
  });

  it("every encoder is reachable via MSFVENOM_ENCODERS_BY_ID", () => {
    for (const e of MSFVENOM_ENCODERS) {
      expect(MSFVENOM_ENCODERS_BY_ID[e.id]).toBe(e);
    }
  });
});
