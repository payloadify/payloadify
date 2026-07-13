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

  it("does not include the fabricated windows/meterpreter/reverse_tcp_dll payload (DLL is -f dll on the base payload)", () => {
    expect(MSFVENOM_PAYLOADS_BY_ID["windows/meterpreter/reverse_tcp_dll"]).toBeUndefined();
  });

  it("Android payloads force -o with a .apk extension, since -f raw is the only real format", () => {
    const androidPayloads = MSFVENOM_PAYLOADS.filter((p) => p.platform === "android");
    expect(androidPayloads.length).toBeGreaterThan(0);
    for (const p of androidPayloads) {
      expect(p.compatibleFormats).toEqual(["raw"]);
      expect(p.forceOutputFilename).toBe(true);
      expect(p.filenameExtension).toBe("apk");
    }
  });

  it("Android payloads have no architecture (real msfvenom -a values have no Android ABI name)", () => {
    for (const p of MSFVENOM_PAYLOADS.filter((p) => p.platform === "android")) {
      expect(p.archs).toEqual([]);
      expect(p.defaultArch).toBeNull();
    }
  });

  it("no payload references the invalid Android-ABI or chip-generation ARM arch ids", () => {
    const invalidArchIds = ["armeabi-v7a", "arm64-v8a", "armv5l", "armv5b", "armv6l", "armv7l"];
    for (const p of MSFVENOM_PAYLOADS) {
      for (const archId of p.archs) {
        expect(invalidArchIds).not.toContain(archId);
      }
    }
  });

  it("path-segment payload ids contain the {arch} token; other placements don't", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      if (p.archPlacement === "path-segment") {
        expect(p.id).toContain("{arch}");
      } else {
        expect(p.id).not.toContain("{arch}");
      }
    }
  });

  it("windows-arch-segment payload ids are flat (no arch segment baked in — resolvePayloadId inserts x64/ at generation time)", () => {
    for (const p of MSFVENOM_PAYLOADS) {
      if (p.archPlacement === "windows-arch-segment") {
        expect(p.id.startsWith("windows/")).toBe(true);
        expect(p.id).not.toMatch(/^windows\/x64\//);
      }
    }
  });

  it("the UDP shell payload (no x64 stager module) is restricted to x86", () => {
    const shellUdp = MSFVENOM_PAYLOADS_BY_ID["windows/shell/reverse_udp"];
    expect(shellUdp.archs).toEqual(["x86"]);
    expect(shellUdp.staging).toBe("staged");
  });

  it("does not offer windows/meterpreter/reverse_udp — Meterpreter's stage transfer isn't valid over UDP", () => {
    expect(MSFVENOM_PAYLOADS_BY_ID["windows/meterpreter/reverse_udp"]).toBeUndefined();
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
