import { describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATE_ID, NMAP_TEMPLATES, NMAP_TEMPLATES_BY_ID } from "./templates";

describe("NMAP_TEMPLATES", () => {
  it("has exactly 8 templates", () => {
    expect(NMAP_TEMPLATES).toHaveLength(8);
  });

  it("has unique ids", () => {
    const ids = NMAP_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves DEFAULT_TEMPLATE_ID to a real template", () => {
    expect(NMAP_TEMPLATES_BY_ID[DEFAULT_TEMPLATE_ID]).toBeDefined();
  });

  it("every template has non-empty fixedFlags and notes", () => {
    for (const t of NMAP_TEMPLATES) {
      expect(t.fixedFlags.length).toBeGreaterThan(0);
      expect(t.notes.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });

  /** Every token here is drawn only from the confirmed Nmap-Cheatsheet reference
   *  (github.com/jasonniebauer/Nmap-Cheatsheet) this tool was built against — either a flag
   *  itself, or a known argument that flag accepts. This test is a permanent guard against a
   *  future template accidentally introducing an unverified/invented flag or argument. */
  const CONFIRMED_FLAG_TOKENS = new Set([
    "-F",
    "-T2",
    "-T4",
    "-sS",
    "-sU",
    "-sn",
    "-Pn",
    "-A",
    "-sV",
    "-sC",
    "-p",
    "1-65535",
    "--top-ports",
    "100",
    "--script",
    "vuln",
    "-f",
    "-D",
    "RND:10",
    "--data-length",
    "24",
  ]);

  it("uses only confirmed flag tokens across every template", () => {
    for (const t of NMAP_TEMPLATES) {
      for (const token of t.fixedFlags) {
        expect(CONFIRMED_FLAG_TOKENS.has(token), `Unconfirmed token "${token}" in template "${t.id}"`).toBe(true);
      }
    }
  });
});
