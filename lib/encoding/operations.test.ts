import { describe, expect, it } from "vitest";
import { ENCODING_OPERATIONS_BY_ID } from "./operations";

const base64 = ENCODING_OPERATIONS_BY_ID["base64"];
const hex = ENCODING_OPERATIONS_BY_ID["hex"];
const url = ENCODING_OPERATIONS_BY_ID["url"];
const htmlEntity = ENCODING_OPERATIONS_BY_ID["html-entity"];
const unicodeEscape = ENCODING_OPERATIONS_BY_ID["unicode-escape"];

describe("base64", () => {
  it("matches a known reference value", () => {
    expect(base64.encode("hello")).toBe("aGVsbG8=");
  });

  it("round-trips ASCII and emoji (surrogate pair) input", () => {
    for (const text of ["hello world", "😀 payload", "日本語"]) {
      expect(base64.decode(base64.encode(text))).toBe(text);
    }
  });

  it("throws a clear error on invalid Base64", () => {
    expect(() => base64.decode("not-valid-base64!!!")).toThrow(/invalid base64/i);
  });

  it("decodes raw Windows-1251 bytes as Cyrillic text when that charset is selected", () => {
    // "Привет" as raw Windows-1251 bytes, base64-encoded — encode direction can't produce
    // Windows-1251 bytes itself (only UTF-8/UTF-16), so this fixture is pre-built instead.
    expect(base64.decode("z/Do4uXy", { charset: "windows-1251" })).toBe("Привет");
  });

  it("auto-detects UTF-8 on decode", () => {
    const encoded = base64.encode("hello world");
    expect(base64.decode(encoded, { charset: "auto" })).toBe("hello world");
  });

  it("throws a clear error when auto-detect can't confidently identify the charset", () => {
    expect(() => base64.decode("z/Do4uXy", { charset: "auto" })).toThrow(/couldn't confidently auto-detect/i);
  });
});

describe("hex", () => {
  it("matches a known reference value", () => {
    expect(hex.encode("hello")).toBe("68656c6c6f");
  });

  it("round-trips ASCII and emoji input", () => {
    for (const text of ["hello world", "😀 payload"]) {
      expect(hex.decode(hex.encode(text))).toBe(text);
    }
  });

  it("throws on odd-length hex", () => {
    expect(() => hex.decode("abc")).toThrow(/invalid hex/i);
  });

  it("throws on non-hex characters", () => {
    expect(() => hex.decode("zzzz")).toThrow(/invalid hex/i);
  });

  it("decodes raw Windows-1251 bytes as Cyrillic text when that charset is selected", () => {
    expect(hex.decode("cff0e8e2e5f2", { charset: "windows-1251" })).toBe("Привет");
  });
});

describe("url", () => {
  it("matches a known reference value (parity with the previous encodeURIComponent-based implementation)", () => {
    expect(url.encode("a b&c")).toBe("a%20b%26c");
  });

  it("round-trips", () => {
    expect(url.decode(url.encode("a b&c=d?e"))).toBe("a b&c=d?e");
  });

  it("throws a clear error on a malformed % escape", () => {
    expect(() => url.decode("%")).toThrow(/malformed % escape/i);
  });

  it("throws a clear error on a literal non-ASCII character outside a %XX escape", () => {
    expect(() => url.decode("café")).toThrow(/non-ascii character/i);
  });

  it("decodes raw Windows-1251 bytes as Cyrillic text when that charset is selected", () => {
    expect(url.decode("%CF%F0%E8%E2%E5%F2", { charset: "windows-1251" })).toBe("Привет");
  });
});

describe("html-entity", () => {
  it("'all' mode encodes every character as a numeric entity", () => {
    expect(htmlEntity.encode("<a>", { mode: "all" })).toBe("&#60;&#97;&#62;");
  });

  it("'reserved-only' mode only escapes the 5 reserved characters", () => {
    expect(htmlEntity.encode("<a>", { mode: "reserved-only" })).toBe("&lt;a&gt;");
  });

  it("the two modes produce different output for the same input", () => {
    expect(htmlEntity.encode("<script>", { mode: "all" })).not.toBe(
      htmlEntity.encode("<script>", { mode: "reserved-only" }),
    );
  });

  it("decodes both numeric and named entities", () => {
    expect(htmlEntity.decode("&#60;script&#62;")).toBe("<script>");
    expect(htmlEntity.decode("&lt;script&gt;")).toBe("<script>");
  });

  it("leaves a stray unescaped & alone", () => {
    expect(htmlEntity.decode("Tom & Jerry")).toBe("Tom & Jerry");
  });

  it("throws on an unknown named entity", () => {
    expect(() => htmlEntity.decode("&foo;")).toThrow(/unknown named html entity/i);
  });
});

describe("unicode-escape", () => {
  it("'all' mode escapes every character", () => {
    expect(unicodeEscape.encode("AB", { mode: "all" })).toBe("\\u0041\\u0042");
  });

  it("'non-ascii-only' mode leaves ASCII untouched", () => {
    expect(unicodeEscape.encode("AB", { mode: "non-ascii-only" })).toBe("AB");
    expect(unicodeEscape.encode("é", { mode: "non-ascii-only" })).toBe("\\u00e9");
  });

  it("round-trips astral (surrogate pair) characters", () => {
    expect(unicodeEscape.decode(unicodeEscape.encode("😀", { mode: "all" }))).toBe("😀");
  });

  it("throws on a truncated \\u escape", () => {
    expect(() => unicodeEscape.decode("\\u12")).toThrow(/invalid unicode escape/i);
  });
});

describe("chaining", () => {
  it("composes across operations and reverses back to the original text", () => {
    const original = "Hello, World! 😀";
    const encoded = url.encode(base64.encode(original));
    const decoded = base64.decode(url.decode(encoded));
    expect(decoded).toBe(original);
  });
});
