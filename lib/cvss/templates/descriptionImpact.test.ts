import { describe, expect, it } from "vitest";
import { getDescriptionImpactDraft, TEMPLATE_DESCRIPTION_IMPACT, VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT } from "./descriptionImpact";
import { CVSS_TEMPLATES } from "./templates";
import { VULN_TYPES } from "./vulnTypes";

const overclaimPhrases = ["grants full", "guarantees", "always results in", "complete takeover"];

function checkEntry(id: string, entry: { description: string; impact: string }) {
  expect(entry.description.trim().length, id).toBeGreaterThan(0);
  expect(entry.impact.trim().length, id).toBeGreaterThan(0);
  const lower = entry.impact.toLowerCase();
  for (const phrase of overclaimPhrases) {
    expect(lower.includes(phrase), `${id}'s impact text overclaims with "${phrase}"`).toBe(false);
  }
}

describe("VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT coverage", () => {
  it("has an entry for every VULN_TYPES id", () => {
    for (const v of VULN_TYPES) {
      expect(VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT[v.id], `missing fallback description/impact draft for "${v.id}"`).toBeDefined();
    }
  });

  it("has no stray entries for unknown vuln type ids", () => {
    const validIds = new Set(VULN_TYPES.map((v) => v.id));
    for (const id of Object.keys(VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT)) {
      expect(validIds.has(id), `"${id}" is not a real VulnType id`).toBe(true);
    }
  });

  it("every entry is non-empty and hedges rather than overclaiming", () => {
    for (const [id, entry] of Object.entries(VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT)) {
      checkEntry(id, entry);
    }
  });
});

describe("TEMPLATE_DESCRIPTION_IMPACT coverage", () => {
  it("has an entry for every CVSS_TEMPLATES id", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(TEMPLATE_DESCRIPTION_IMPACT[t.id], `missing template description/impact draft for "${t.id}"`).toBeDefined();
    }
  });

  it("has no stray entries for unknown template ids", () => {
    const validIds = new Set(CVSS_TEMPLATES.map((t) => t.id));
    for (const id of Object.keys(TEMPLATE_DESCRIPTION_IMPACT)) {
      expect(validIds.has(id), `"${id}" is not a real CvssTemplate id`).toBe(true);
    }
  });

  it("every entry is non-empty and hedges rather than overclaiming", () => {
    for (const [id, entry] of Object.entries(TEMPLATE_DESCRIPTION_IMPACT)) {
      checkEntry(id, entry);
    }
  });

  it("gives each template within a vuln type its own distinct draft, not a shared one", () => {
    const byVulnType = new Map<string, string[]>();
    for (const t of CVSS_TEMPLATES) {
      const list = byVulnType.get(t.vulnTypeId) ?? [];
      list.push(t.id);
      byVulnType.set(t.vulnTypeId, list);
    }
    for (const [vulnTypeId, templateIds] of byVulnType) {
      const descriptions = templateIds.map((id) => TEMPLATE_DESCRIPTION_IMPACT[id]?.description);
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size, `${vulnTypeId}'s templates share duplicate description text`).toBe(descriptions.length);
    }
  });
});

describe("getDescriptionImpactDraft", () => {
  it("prefers the template-level draft when both a vuln type and template are given", () => {
    const draft = getDescriptionImpactDraft("xss", "xss-stored-web");
    expect(draft).toEqual(TEMPLATE_DESCRIPTION_IMPACT["xss-stored-web"]);
  });

  it("falls back to the vuln-type draft when no template is selected", () => {
    const draft = getDescriptionImpactDraft("xss", null);
    expect(draft).toEqual(VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT["xss"]);
  });

  it("returns empty strings when neither a vuln type nor template is selected", () => {
    expect(getDescriptionImpactDraft(null, null)).toEqual({ description: "", impact: "" });
  });
});
