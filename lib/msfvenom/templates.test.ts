import { describe, expect, it } from "vitest";
import { MSFVENOM_FORMATS_BY_ID } from "./formats";
import { MSFVENOM_PAYLOADS_BY_ID } from "./payloads";
import { MSFVENOM_TEMPLATES } from "./templates";

// windows/powershell_reverse_tcp is a native (non-shellcode) payload and doesn't support EXITFUNC —
// see the comment on that payload in payloads.ts — so powershell-windows is deliberately excluded.
const WINDOWS_EXITFUNC_TEMPLATE_IDS = [
  "windows-meterpreter-x86",
  "windows-meterpreter-x64",
  "windows-stageless-shell",
  "vbs-windows",
];

describe("MSFVENOM_TEMPLATES", () => {
  it("has exactly 10 templates with unique ids", () => {
    expect(MSFVENOM_TEMPLATES).toHaveLength(10);
    const ids = MSFVENOM_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template references a real payload and its formatId/archId are compatible", () => {
    for (const t of MSFVENOM_TEMPLATES) {
      const payload = MSFVENOM_PAYLOADS_BY_ID[t.payloadId];
      expect(payload, `${t.id} references unknown payload ${t.payloadId}`).toBeDefined();
      expect(payload.compatibleFormats).toContain(t.formatId);
      expect(MSFVENOM_FORMATS_BY_ID[t.formatId]).toBeDefined();

      if (payload.archs.length === 0) {
        expect(t.archId).toBeNull();
      } else {
        expect(payload.archs).toContain(t.archId);
      }
    }
  });

  it("has iterations of 0 whenever encoderId is none", () => {
    for (const t of MSFVENOM_TEMPLATES) {
      if (t.encoderId === "none") expect(t.iterations).toBe(0);
    }
  });

  it("sets exitfunc thread only for the windows-platform templates", () => {
    for (const t of MSFVENOM_TEMPLATES) {
      if (WINDOWS_EXITFUNC_TEMPLATE_IDS.includes(t.id)) {
        expect(t.exitfunc).toBe("thread");
      } else {
        expect(t.exitfunc).toBeNull();
      }
    }
  });
});
