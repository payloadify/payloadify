import { describe, expect, it } from "vitest";
import { buildBenchmarkCommand, buildCommand, buildShowCommand } from "./generate";
import { HashcatSelection } from "./params";

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

describe("buildCommand", () => {
  it("builds a straight/dictionary attack command", () => {
    expect(buildCommand(baseSelection())).toBe("hashcat -m 1000 -a 0 'b4b9b02e6f09a9bd760f388b67351e2b' 'rockyou.txt'");
  });

  it("single-quotes a hash value containing shell metacharacters like $", () => {
    const sel = baseSelection({
      mode: 3200,
      target: { kind: "value", value: "$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6" },
    });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 3200 -a 0 '$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6' 'rockyou.txt'",
    );
  });

  it("escapes an embedded single quote in the hash value instead of breaking out of the quoting", () => {
    const sel = baseSelection({ target: { kind: "value", value: "abc' ; touch pwned #" } });
    expect(buildCommand(sel)).toBe("hashcat -m 1000 -a 0 'abc'\\'' ; touch pwned #' 'rockyou.txt'");
  });

  it("quotes a wordlist path containing a space instead of splitting into extra args", () => {
    const sel = baseSelection({ wordlist: "/mnt/word lists/rockyou.txt" });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 0 'b4b9b02e6f09a9bd760f388b67351e2b' '/mnt/word lists/rockyou.txt'",
    );
  });

  it("does not quote a hash file path", () => {
    const sel = baseSelection({ target: { kind: "file", value: "hashes.txt" } });
    expect(buildCommand(sel)).toBe("hashcat -m 1000 -a 0 hashes.txt 'rockyou.txt'");
  });

  it("builds a combination attack command with two wordlists", () => {
    const sel = baseSelection({ attackMode: "1", wordlist: "wl1.txt", wordlist2: "wl2.txt" });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 1 'b4b9b02e6f09a9bd760f388b67351e2b' 'wl1.txt' 'wl2.txt'",
    );
  });

  it("builds a mask/brute-force attack command with custom charsets and increment", () => {
    const sel = baseSelection({
      attackMode: "3",
      wordlist: "",
      mask: "?1?1?1?1?d?d?d?d",
      charset1: "?l?u",
      incrementEnabled: true,
      incrementMin: 4,
      incrementMax: 8,
    });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 3 -1 '?l?u' --increment --increment-min 4 --increment-max 8 'b4b9b02e6f09a9bd760f388b67351e2b' '?1?1?1?1?d?d?d?d'",
    );
  });

  it("builds a hybrid wordlist+mask attack command", () => {
    const sel = baseSelection({ attackMode: "6", wordlist: "rockyou.txt", mask: "?d?d?d?d" });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 6 'b4b9b02e6f09a9bd760f388b67351e2b' 'rockyou.txt' '?d?d?d?d'",
    );
  });

  it("builds a hybrid mask+wordlist attack command", () => {
    const sel = baseSelection({ attackMode: "7", wordlist: "rockyou.txt", mask: "?d?d?d?d" });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 7 'b4b9b02e6f09a9bd760f388b67351e2b' '?d?d?d?d' 'rockyou.txt'",
    );
  });

  it("includes repeated -r rule flags in order", () => {
    const sel = baseSelection({ rules: ["best64.rule", "d3ad0ne.rule"] });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 0 -r 'best64.rule' -r 'd3ad0ne.rule' 'b4b9b02e6f09a9bd760f388b67351e2b' 'rockyou.txt'",
    );
  });

  it("includes advanced flags in the expected order", () => {
    const sel = baseSelection({
      workload: 3,
      optimizedKernel: true,
      force: true,
      potfileDisable: true,
      usernameMode: true,
      sessionName: "job1",
      outfile: "cracked.txt",
      outfileFormat: "2",
    });
    expect(buildCommand(sel)).toBe(
      "hashcat -m 1000 -a 0 -w 3 -O --force --potfile-disable --username --session 'job1' -o 'cracked.txt' --outfile-format '2' 'b4b9b02e6f09a9bd760f388b67351e2b' 'rockyou.txt'",
    );
  });
});

describe("buildShowCommand", () => {
  it("builds a --show command with the quoted hash value", () => {
    expect(buildShowCommand(baseSelection())).toBe("hashcat -m 1000 'b4b9b02e6f09a9bd760f388b67351e2b' --show");
  });

  it("does not quote a hash file path", () => {
    const sel = baseSelection({ target: { kind: "file", value: "hashes.txt" } });
    expect(buildShowCommand(sel)).toBe("hashcat -m 1000 hashes.txt --show");
  });
});

describe("buildBenchmarkCommand", () => {
  it("builds a benchmark command for a given mode", () => {
    expect(buildBenchmarkCommand(1000)).toBe("hashcat -b -m 1000");
  });
});
