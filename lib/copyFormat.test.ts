import { describe, expect, it } from "vitest";
import { formatList } from "./copyFormat";

const FIELDS = [
  { id: "hsts", label: "HSTS", value: "Strict-Transport-Security: present" },
  { id: "csp", label: "CSP", value: "Content-Security-Policy: warn" },
  { id: "xfo", label: "X-Frame-Options", value: "X-Frame-Options: missing" },
];

describe("formatList", () => {
  it("joins with newline only, no style prefix, for 'none'", () => {
    expect(formatList(FIELDS, ["hsts", "csp", "xfo"], { kind: "none" })).toBe(
      "Strict-Transport-Security: present\nContent-Security-Policy: warn\nX-Frame-Options: missing",
    );
  });

  it("prefixes each line with '- ' for 'bullets'", () => {
    const result = formatList(FIELDS, ["hsts", "csp", "xfo"], { kind: "bullets" });
    expect(result.split("\n")).toEqual([
      "- Strict-Transport-Security: present",
      "- Content-Security-Policy: warn",
      "- X-Frame-Options: missing",
    ]);
  });

  it("numbers each line 1-indexed for 'numbers'", () => {
    const result = formatList(FIELDS, ["hsts", "csp", "xfo"], { kind: "numbers" });
    expect(result.split("\n")).toEqual([
      "1. Strict-Transport-Security: present",
      "2. Content-Security-Policy: warn",
      "3. X-Frame-Options: missing",
    ]);
  });

  it("uses the user-supplied prefix verbatim for 'custom'", () => {
    const result = formatList([FIELDS[0]], ["hsts"], { kind: "custom", prefix: "-> " });
    expect(result).toBe("-> Strict-Transport-Security: present");
  });

  it("respects a custom order and appends unlisted fields afterward", () => {
    const result = formatList(FIELDS, ["xfo", "hsts"], { kind: "none" });
    expect(result.split("\n")).toEqual([
      "X-Frame-Options: missing",
      "Strict-Transport-Security: present",
      "Content-Security-Policy: warn",
    ]);
  });

  it("handles an empty fields array", () => {
    expect(formatList([], [], { kind: "none" })).toBe("");
  });

  it("handles a single field", () => {
    expect(formatList([FIELDS[0]], ["hsts"], { kind: "bullets" })).toBe("- Strict-Transport-Security: present");
  });
});
