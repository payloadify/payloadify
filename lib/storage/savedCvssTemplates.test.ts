import { afterEach, describe, expect, it } from "vitest";
import { EMPTY_CVSS_META } from "../cvss/templates/types";
import { CVSS31_DEFAULT_METRICS } from "../cvss/v3_1/metrics";
import { CVSS40_DEFAULT_METRICS } from "../cvss/v4_0/metrics";
import {
  MAX_SAVED_CVSS_TEMPLATES,
  mergeImportedCvssTemplates,
  parseSavedCvssTemplatesImport,
  SavedCvssTemplate,
} from "./savedCvssTemplates";

const KEY = "test:cvss-templates";

afterEach(() => {
  localStorage.removeItem(KEY);
});

function makeTemplate(id: string): SavedCvssTemplate {
  return {
    id,
    name: `template-${id}`,
    platformFilter: "web",
    vulnTypeId: null,
    cvss31: CVSS31_DEFAULT_METRICS,
    cvss40: CVSS40_DEFAULT_METRICS,
    meta: EMPTY_CVSS_META,
  };
}

describe("parseSavedCvssTemplatesImport", () => {
  it("errors on invalid JSON", () => {
    expect(parseSavedCvssTemplatesImport("{not json")).toEqual({ error: "That file isn't valid JSON." });
  });

  it("errors when the parsed value isn't an array", () => {
    const result = parseSavedCvssTemplatesImport(JSON.stringify({ a: 1 }));
    expect("error" in result).toBe(true);
  });

  it("errors on an empty array", () => {
    const result = parseSavedCvssTemplatesImport("[]");
    expect("error" in result).toBe(true);
  });

  it("errors when no entries are valid templates", () => {
    const result = parseSavedCvssTemplatesImport(JSON.stringify([{ foo: "bar" }, "garbage", null]));
    expect("error" in result).toBe(true);
  });

  it("returns valid templates and counts invalid ones skipped", () => {
    const valid = makeTemplate("1");
    const result = parseSavedCvssTemplatesImport(JSON.stringify([valid, { foo: "bar" }]));
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.templates).toEqual([valid]);
      expect(result.skippedInvalid).toBe(1);
    }
  });
});

describe("mergeImportedCvssTemplates", () => {
  it("adds new templates without touching existing ones", () => {
    const existing = [makeTemplate("1")];
    const incoming = [makeTemplate("2"), makeTemplate("3")];
    const result = mergeImportedCvssTemplates(existing, incoming);
    expect(result.kept.map((t) => t.id)).toEqual(["1", "2", "3"]);
    expect(result.added).toBe(2);
    expect(result.duplicates).toBe(0);
    expect(result.skippedForCap).toBe(0);
  });

  it("skips incoming templates whose id already exists", () => {
    const existing = [makeTemplate("1"), makeTemplate("2")];
    const incoming = [makeTemplate("2"), makeTemplate("3")];
    const result = mergeImportedCvssTemplates(existing, incoming);
    expect(result.kept.map((t) => t.id)).toEqual(["1", "2", "3"]);
    expect(result.added).toBe(1);
    expect(result.duplicates).toBe(1);
    expect(result.skippedForCap).toBe(0);
  });

  it("stops at the cap and reports how many were skipped, without dropping existing templates", () => {
    const existing = Array.from({ length: MAX_SAVED_CVSS_TEMPLATES - 1 }, (_, i) => makeTemplate(`existing-${i}`));
    const incoming = [makeTemplate("new-1"), makeTemplate("new-2"), makeTemplate("new-3")];
    const result = mergeImportedCvssTemplates(existing, incoming);
    expect(result.kept).toHaveLength(MAX_SAVED_CVSS_TEMPLATES);
    expect(result.kept.slice(0, existing.length).map((t) => t.id)).toEqual(existing.map((t) => t.id));
    expect(result.added).toBe(1);
    expect(result.skippedForCap).toBe(2);
    expect(result.duplicates).toBe(0);
  });
});
