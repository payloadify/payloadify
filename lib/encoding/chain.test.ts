import { describe, expect, it } from "vitest";
import { computeChain, Step } from "./chain";
import { ENCODING_OPERATIONS_BY_ID } from "./operations";

const base64Op = ENCODING_OPERATIONS_BY_ID["base64"];

describe("computeChain — decode line mode", () => {
  it("isolates a bad line's error without clearing the valid lines' results", () => {
    // hex("hello") = 68656c6c6f, "ZZ" is invalid hex, hex("world") = 776f726c64
    const steps: Step[] = [{ id: 1, operationId: "hex", lineMode: true }];
    const { results } = computeChain("68656c6c6f\nZZ\n776f726c64", steps, "decode");

    expect(results[0].kind).toBe("lines");
    if (results[0].kind !== "lines") throw new Error("unreachable");
    expect(results[0].lines[0]).toEqual({ output: "hello", error: null });
    expect(results[0].lines[1].output).toBeNull();
    expect(results[0].lines[1].error).toMatch(/invalid hex/i);
    expect(results[0].lines[2]).toEqual({ output: "world", error: null });
  });

  it("propagates only the successfully-decoded lines to the next step, excluding the failed line", () => {
    const steps: Step[] = [
      { id: 1, operationId: "hex", lineMode: true },
      { id: 2, operationId: "url" },
    ];
    const { results } = computeChain("68656c6c6f\nZZ\n776f726c64", steps, "decode");

    expect(results[1]).toEqual({ kind: "single", output: "hello\nworld", error: null });
  });

  it("propagates null (blocking downstream steps) when every line fails", () => {
    const steps: Step[] = [
      { id: 1, operationId: "hex", lineMode: true },
      { id: 2, operationId: "url" },
    ];
    const { results } = computeChain("ZZ\nYY", steps, "decode");

    expect(results[1]).toEqual({ kind: "single", output: null, error: null });
  });
});

describe("computeChain — encode line/chunk/separator options", () => {
  it("encodes each line separately and joins with the default LF separator", () => {
    const steps: Step[] = [{ id: 1, operationId: "base64", encodeLineMode: true }];
    const { results } = computeChain("foo\nbar", steps, "encode");

    expect(results[0]).toEqual({
      kind: "single",
      output: `${base64Op.encode("foo")}\n${base64Op.encode("bar")}`,
      error: null,
    });
  });

  it("wraps a long single encoded value into fixed-width chunks", () => {
    const longInput = "this is a reasonably long string to force chunking";
    const steps: Step[] = [{ id: 1, operationId: "base64", chunkWidth: 10 }];
    const { results } = computeChain(longInput, steps, "encode");

    expect(results[0].kind).toBe("single");
    if (results[0].kind !== "single" || results[0].output === null) throw new Error("unreachable");
    const lines = results[0].output.split("\n");
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines.slice(0, -1)) expect(line).toHaveLength(10);
    expect(lines.join("")).toBe(base64Op.encode(longInput));
  });

  it("combines encode-each-line and chunking without merging entries onto the same line", () => {
    const steps: Step[] = [{ id: 1, operationId: "base64", encodeLineMode: true, chunkWidth: 2 }];
    const { results } = computeChain("AB\nCD", steps, "encode");

    // base64("AB") = "QUI=", base64("CD") = "Q0Q=" — each independently wrapped at width 2.
    expect(results[0]).toEqual({ kind: "single", output: "QU\nI=\nQ0\nQ=", error: null });
  });

  it("uses CRLF when the newline separator is set to CRLF", () => {
    const steps: Step[] = [{ id: 1, operationId: "base64", encodeLineMode: true, newlineSeparator: "CRLF" }];
    const { results } = computeChain("foo\nbar", steps, "encode");

    expect(results[0]).toEqual({
      kind: "single",
      output: `${base64Op.encode("foo")}\r\n${base64Op.encode("bar")}`,
      error: null,
    });
  });
});
