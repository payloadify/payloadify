import { describe, expect, it } from "vitest";
import { HashcatSelection } from "./params";
import { isValidMode, validateSelection } from "./validation";

function baseSelection(overrides: Partial<HashcatSelection> = {}): HashcatSelection {
  return {
    mode: 1000,
    attackMode: "0",
    target: { kind: "value", value: "b4b9b02e6f09a9bd760f388b67351e2b" },
    wordlist: "rockyou.txt",
    wordlist2: "",
    mask: "",
    rules: [],
    charset1: "",
    charset2: "",
    charset3: "",
    charset4: "",
    incrementEnabled: false,
    incrementMin: null,
    incrementMax: null,
    workload: null,
    optimizedKernel: false,
    force: false,
    potfileDisable: false,
    usernameMode: false,
    sessionName: "",
    outfile: "",
    outfileFormat: "",
    ...overrides,
  };
}

describe("isValidMode", () => {
  it("accepts 0 and positive integers", () => {
    expect(isValidMode(0)).toBe(true);
    expect(isValidMode(1000)).toBe(true);
  });

  it("rejects negative numbers and non-integers", () => {
    expect(isValidMode(-1)).toBe(false);
    expect(isValidMode(1.5)).toBe(false);
    expect(isValidMode(NaN)).toBe(false);
  });
});

describe("validateSelection", () => {
  it("passes for a valid dictionary attack selection", () => {
    expect(validateSelection(baseSelection())).toEqual({ ok: true });
  });

  it("fails for an invalid mode", () => {
    expect(validateSelection(baseSelection({ mode: -1 })).ok).toBe(false);
  });

  it("fails when the target value is empty", () => {
    const result = validateSelection(baseSelection({ target: { kind: "value", value: "" } }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/hash value/i);
  });

  it("fails with a file-specific message when target is a file and empty", () => {
    const result = validateSelection(baseSelection({ target: { kind: "file", value: "  " } }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/file path/i);
  });

  it("fails when a mask attack has no mask", () => {
    const result = validateSelection(baseSelection({ attackMode: "3", wordlist: "", mask: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/mask/i);
  });

  it("fails when a combination attack is missing the second wordlist", () => {
    const result = validateSelection(baseSelection({ attackMode: "1", wordlist2: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/second wordlist/i);
  });

  it("fails when increment min is greater than increment max", () => {
    const result = validateSelection(
      baseSelection({ attackMode: "3", wordlist: "", mask: "?d?d?d?d", incrementEnabled: true, incrementMin: 8, incrementMax: 4 }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/increment/i);
  });
});
