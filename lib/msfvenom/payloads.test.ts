import { describe, expect, it } from "vitest";
import { MSFVENOM_ARCHS_BY_ID } from "./archs";
import { MSFVENOM_FORMATS_BY_ID } from "./formats";
import { MSFVENOM_PAYLOADS, MSFVENOM_PAYLOADS_BY_ID } from "./payloads";

describe("MSFVENOM_PAYLOADS", () => {
  it("has unique ids", () => {
    const ids = MSFVENOM_PAYLOADS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every compatibleFormats entry exists in the format catalog", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      for (const formatId of p.compatibleFormats) {
        expect(MSFVENOM_FORMATS_BY_ID[formatId], `${p.id} references unknown format ${formatId}`).toBeDefined();
      }
    }
  });

  it("every archs entry exists in the arch catalog", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      for (const archId of p.archs) {
        expect(MSFVENOM_ARCHS_BY_ID[archId], `${p.id} references unknown arch ${archId}`).toBeDefined();
      }
    }
  });

  it("path-segment payload ids contain the {arch} token; flag-only ids don't", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      if (p.archPlacement === "path-segment") {
        expect(p.id).toContain("{arch}");
      } else {
        expect(p.id).not.toContain("{arch}");
      }
    }
  });

  it("stagingSiblingId relationships are symmetric when present", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      if (p.stagingSiblingId === null) continue;
      const sibling = MSFVENOM_PAYLOADS_BY_ID[p.stagingSiblingId];
      expect(sibling, `${p.id} points to missing sibling ${p.stagingSiblingId}`).toBeDefined();
      expect(sibling.stagingSiblingId).toBe(p.id);
      expect(sibling.staging).not.toBe(p.staging);
    }
  });

  it("the python payload has no architecture and no EXITFUNC support", () => {
    const python = MSFVENOM_PAYLOADS_BY_ID["python/meterpreter/reverse_tcp"];
    expect(python.archs).toEqual([]);
    expect(python.defaultArch).toBeNull();
    expect(python.supportsExitfunc).toBe(false);
  });

  it("supportsExitfunc is true iff platform is windows", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      expect(p.supportsExitfunc).toBe(p.platform === "windows");
    }
  });

  it("every payload with a non-empty archs list has a defaultArch that's a member of it", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      if (p.archs.length > 0) {
        expect(p.defaultArch).not.toBeNull();
        expect(p.archs).toContain(p.defaultArch);
      }
    }
  });
});
