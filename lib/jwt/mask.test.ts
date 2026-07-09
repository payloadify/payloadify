import { describe, expect, it } from "vitest";
import { maskMiddle, maskPem } from "./mask";

describe("maskMiddle", () => {
  it("returns an empty string unchanged", () => {
    expect(maskMiddle("")).toBe("");
  });

  it("masks the middle of a long string, keeping head and tail", () => {
    const masked = maskMiddle("abcdefghijklmnopqrstuvwxyz0123456789", 4, 4);
    expect(masked.startsWith("abcd")).toBe(true);
    expect(masked.endsWith("6789")).toBe(true);
    expect(masked).not.toContain("ijklmnop");
  });

  it("caps the masked run length regardless of how long the middle actually is", () => {
    const masked = maskMiddle("a".repeat(4) + "b".repeat(500) + "c".repeat(4), 4, 4);
    expect(masked.length).toBeLessThan(30);
  });

  it("fully masks strings too short to safely reveal both head and tail", () => {
    const masked = maskMiddle("short", 4, 4);
    expect(masked).toBe("•".repeat(5));
  });

  it("fully masks a string exactly at the boundary (no room for a hidden middle)", () => {
    const masked = maskMiddle("abcdefgh", 4, 4); // length 8 == headChars+tailChars, 0 room to hide
    expect(masked).toBe("•".repeat(8));
  });

  it("reveals head/tail once there's at least one hidden character in the middle", () => {
    const masked = maskMiddle("abcdefghi", 4, 4); // length 9, 1 char in the middle
    expect(masked).toBe("abcd•fghi");
  });
});

describe("maskPem", () => {
  const pem = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----`;

  it("keeps the BEGIN/END markers fully intact", () => {
    const masked = maskPem(pem);
    expect(masked).toContain("-----BEGIN PRIVATE KEY-----");
    expect(masked).toContain("-----END PRIVATE KEY-----");
  });

  it("shows head and tail of the key body but hides the middle", () => {
    const masked = maskPem(pem, 12, 12);
    expect(masked).toContain("MIIEvQIBADAN"); // first 12 chars of flattened body
    expect(masked).toContain("YyCFGeJZ"); // last chars of flattened body
    expect(masked).not.toContain("MzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu");
  });

  it("falls back to flat masking for input that isn't a well-formed PEM block", () => {
    const masked = maskPem("not a pem at all but still a longish string of text");
    expect(masked.length).toBeLessThan("not a pem at all but still a longish string of text".length);
  });
});
