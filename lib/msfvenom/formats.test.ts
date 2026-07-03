import { describe, expect, it } from "vitest";
import { MSFVENOM_FORMATS, MSFVENOM_FORMATS_BY_ID } from "./formats";

describe("MSFVENOM_FORMATS", () => {
  it("has unique ids", () => {
    const ids = MSFVENOM_FORMATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every format is reachable via MSFVENOM_FORMATS_BY_ID", () => {
    for (const f of MSFVENOM_FORMATS) {
      expect(MSFVENOM_FORMATS_BY_ID[f.id]).toBe(f);
    }
  });

  it("marks exactly the stdout-dump formats as not producing a file", () => {
    const noFile = new Set(["raw", "hex", "c", "csharp", "java", "vba", "veil"]);
    for (const f of MSFVENOM_FORMATS) {
      expect(f.producesFile).toBe(!noFile.has(f.id));
    }
  });

  it("gives every non-producesFile format an empty extension", () => {
    for (const f of MSFVENOM_FORMATS) {
      if (!f.producesFile) expect(f.extension).toBe("");
    }
  });
});
