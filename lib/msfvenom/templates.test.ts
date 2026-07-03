import { describe, expect, it } from "vitest";
import { MSFVENOM_FORMATS_BY_ID } from "./formats";
import { MSFVENOM_PAYLOADS_BY_ID } from "./payloads";
import { MSFVENOM_TEMPLATES, MSFVENOM_TEMPLATES_BY_ID, RECOMMENDED_TEMPLATE_ID } from "./templates";

const WINDOWS_EXITFUNC_TEMPLATE_IDS = [
  "windows-meterpreter-x86",
  "windows-meterpreter-x64",
  "windows-stageless-shell",
  "powershell-windows",
  "vbs-windows",
];

describe("MSFVENOM_TEMPLATES", () => {
  it("has exactly 10 templates with unique ids", () => {
    expect(MSFVENOM_TEMPLATES).toHaveLength(10);
    const ids = MSFVENOM_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("RECOMMENDED_TEMPLATE_ID points to a real template", () => {
    expect(MSFVENOM_TEMPLATES_BY_ID[RECOMMENDED_TEMPLATE_ID]).toBeDefined();
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
