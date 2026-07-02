import { describe, expect, it } from "vitest";
import { detectCharset } from "./charsets";

const UTF8_BOM = Uint8Array.from([0xef, 0xbb, 0xbf, 0x68, 0x69]); // BOM + "hi"
const UTF16LE_BOM = Uint8Array.from([0xff, 0xfe, 0x68, 0x00]); // BOM + "h"
const UTF16BE_BOM = Uint8Array.from([0xfe, 0xff, 0x00, 0x68]); // BOM + "h"
// "Привет" as raw Windows-1251 bytes — no BOM, and not valid UTF-8.
const WINDOWS_1251_NO_BOM = Uint8Array.from([0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2]);

describe("detectCharset", () => {
  it("detects a UTF-8 BOM", () => {
    expect(detectCharset(UTF8_BOM)).toBe("utf-8");
  });

  it("detects a UTF-16LE BOM", () => {
    expect(detectCharset(UTF16LE_BOM)).toBe("utf-16le");
  });

  it("detects a UTF-16BE BOM", () => {
    expect(detectCharset(UTF16BE_BOM)).toBe("utf-16be");
  });

  it("detects plain valid UTF-8 with no BOM", () => {
    expect(detectCharset(new TextEncoder().encode("hello world"))).toBe("utf-8");
  });

  it("returns null for genuinely non-UTF-8 bytes with no BOM", () => {
    expect(detectCharset(WINDOWS_1251_NO_BOM)).toBeNull();
  });
});
