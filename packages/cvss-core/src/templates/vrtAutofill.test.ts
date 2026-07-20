import { describe, expect, it } from "vitest";
import { CWE_ENTRIES_BY_ID } from "../references/cwe";
import { OWASP_CATEGORIES_BY_ID } from "../references/owasp";
import { VRT_CATEGORIES } from "../references/vrt";
import { VRT_AUTOFILL } from "./vrtAutofill";

describe("VRT_AUTOFILL", () => {
  it("is best-effort: every key resolves to a real VRT_CATEGORIES entry, but not every entry needs a key", () => {
    const vrtIds = new Set(VRT_CATEGORIES.map((v) => v.id));
    for (const vrtId of Object.keys(VRT_AUTOFILL)) {
      expect(vrtIds.has(vrtId), `VRT_AUTOFILL has an entry for unknown VRT id "${vrtId}"`).toBe(true);
    }
  });

  it("every cweId and non-null owaspRefId resolves to a real entry", () => {
    for (const [vrtId, entry] of Object.entries(VRT_AUTOFILL)) {
      expect(CWE_ENTRIES_BY_ID[entry.cweId], `"${vrtId}" references unknown CWE "${entry.cweId}"`).toBeDefined();
      if (entry.owaspRefId) {
        expect(OWASP_CATEGORIES_BY_ID[entry.owaspRefId], `"${vrtId}" references unknown OWASP id "${entry.owaspRefId}"`).toBeDefined();
      }
    }
  });

  it("every entry has at least one reference with a valid https URL", () => {
    for (const [vrtId, entry] of Object.entries(VRT_AUTOFILL)) {
      expect(entry.references.length, `"${vrtId}" has no references`).toBeGreaterThan(0);
      for (const ref of entry.references) {
        expect(ref.url.startsWith("https://"), `"${vrtId}" reference "${ref.label}" is not https`).toBe(true);
      }
    }
  });
});
