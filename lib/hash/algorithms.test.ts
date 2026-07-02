import { describe, expect, it } from "vitest";
import { HASH_ALGORITHMS, HASH_ALGORITHMS_BY_ID } from "./algorithms";

describe("HASH_ALGORITHMS", () => {
  it("computes NTLM as MD4 of the UTF-16LE-encoded plaintext (regression: not UTF-8)", async () => {
    // Reference vector: NTLM('password') == 8846f7eaee8fb117ad06bdd830b7586c
    const ntlm = HASH_ALGORITHMS_BY_ID["ntlm"];
    const result = await ntlm.compute("password");
    expect(result.toLowerCase()).toBe("8846f7eaee8fb117ad06bdd830b7586c");
  });

  it("NTLM output differs from a plain MD4 of the UTF-8 bytes for the same input", async () => {
    // Guards against a regression where NTLM is simplified to reuse the md4 entry's
    // UTF-8 path — the whole point of NTLM is the UTF-16LE encoding difference.
    const ntlm = HASH_ALGORITHMS_BY_ID["ntlm"];
    const md4 = HASH_ALGORITHMS_BY_ID["md4"];
    const [ntlmHash, md4Hash] = await Promise.all([ntlm.compute("password"), md4.compute("password")]);
    expect(ntlmHash.toLowerCase()).not.toBe(md4Hash.toLowerCase());
  });

  it("produces correctly-shaped lowercase hex output of the expected length for every algorithm", async () => {
    const expectedLength: Record<string, number> = {
      md5: 32,
      md4: 32,
      ntlm: 32,
      sha1: 40,
      sha224: 56,
      sha256: 64,
      sha384: 96,
      sha512: 128,
      "sha3-256": 64,
      ripemd160: 40,
    };
    for (const algo of HASH_ALGORITHMS) {
      const result = await algo.compute("hello");
      expect(result).toMatch(/^[0-9a-f]+$/);
      expect(result).toHaveLength(expectedLength[algo.id]);
    }
  });

  it("matches known reference hashes for 'hello'", async () => {
    expect(await HASH_ALGORITHMS_BY_ID["md5"].compute("hello")).toBe("5d41402abc4b2a76b9719d911017c592");
    expect(await HASH_ALGORITHMS_BY_ID["sha256"].compute("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("matches known reference vectors for 'abc' (NIST/RIPEMD test vectors)", async () => {
    expect(await HASH_ALGORITHMS_BY_ID["sha224"].compute("abc")).toBe(
      "23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7",
    );
    expect(await HASH_ALGORITHMS_BY_ID["sha3-256"].compute("abc")).toBe(
      "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
    );
    expect(await HASH_ALGORITHMS_BY_ID["ripemd160"].compute("abc")).toBe(
      "8eb208f7e05d987a9b044a8e98c6b087f15a0bfc",
    );
  });
});
