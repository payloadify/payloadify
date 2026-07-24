import { describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATE_ID, NMAP_TEMPLATES, NMAP_TEMPLATES_BY_ID } from "./templates";

describe("NMAP_TEMPLATES", () => {
  it("has 8 Common Scenarios templates plus 5 Payloadify Advanced templates (13 total)", () => {
    expect(NMAP_TEMPLATES).toHaveLength(13);
    expect(NMAP_TEMPLATES.filter((t) => t.category === "common-scenarios")).toHaveLength(8);
    expect(NMAP_TEMPLATES.filter((t) => t.category === "payloadify-advanced")).toHaveLength(5);
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

  it("every template defines customOverrides for the Custom Build handoff", () => {
    for (const t of NMAP_TEMPLATES) {
      expect(t.customOverrides, `Missing customOverrides for template "${t.id}"`).toBeDefined();
      expect(Object.keys(t.customOverrides).length).toBeGreaterThan(0);
    }
  });

  /** Every token here is drawn only from the confirmed Nmap-Cheatsheet reference
   *  (github.com/jasonniebauer/Nmap-Cheatsheet) this tool was originally built against — either a
   *  flag itself, or a known argument that flag accepts. Covers only the 8 "common-scenarios"
   *  templates. This test is a permanent guard against a future template accidentally introducing
   *  an unverified/invented flag or argument. */
  const CONFIRMED_FLAG_TOKENS_CHEATSHEET = new Set([
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

  /** Every token here is drawn only from nmap's own timing/performance documentation
   *  (nmap.org/book/man-performance.html) and the research done for the "Payloadify Advanced"
   *  timing template set. Covers only templates with category "payloadify-advanced". */
  const CONFIRMED_FLAG_TOKENS_ADVANCED_TIMING = new Set([
    "-n",
    "-T3",
    "--min-hostgroup",
    "4096",
    "64",
    "256",
    "--max-hostgroup",
    "--min-parallelism",
    "100",
    "--min-rate",
    "10000",
    "--max-retries",
    "1",
    "3",
    "6",
    "--initial-rtt-timeout",
    "300ms",
    "500ms",
    "--max-rtt-timeout",
    "4000ms",
    "10000ms",
    "--host-timeout",
    "30m",
    "--defeat-rst-ratelimit",
  ]);

  const CONFIRMED_FLAG_TOKENS = new Set([...CONFIRMED_FLAG_TOKENS_CHEATSHEET, ...CONFIRMED_FLAG_TOKENS_ADVANCED_TIMING]);

  it("uses only confirmed flag tokens across every template", () => {
    for (const t of NMAP_TEMPLATES) {
      for (const token of t.fixedFlags) {
        expect(CONFIRMED_FLAG_TOKENS.has(token), `Unconfirmed token "${token}" in template "${t.id}"`).toBe(true);
      }
    }
  });
});
