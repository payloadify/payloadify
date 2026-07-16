import { describe, expect, it } from "vitest";
import { headerStatusLabel } from "./statusClasses";

describe("headerStatusLabel", () => {
  it("appends 'Optional' only for a missing informational header", () => {
    expect(headerStatusLabel({ status: "missing", informational: true })).toBe("Missing · Optional");
  });

  it("does not append 'Optional' for a missing non-informational header", () => {
    expect(headerStatusLabel({ status: "missing", informational: false })).toBe("Missing");
  });

  it("does not append 'Optional' for a passing informational header", () => {
    expect(headerStatusLabel({ status: "pass", informational: true })).toBe("Pass");
  });

  it("does not append 'Optional' for a warning", () => {
    expect(headerStatusLabel({ status: "warn", informational: true })).toBe("Warn");
  });
});
