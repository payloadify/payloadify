import md4 from "js-md4";
import { sha224 } from "@noble/hashes/sha2.js";
import { sha3_256 } from "@noble/hashes/sha3.js";
import { md5, ripemd160 } from "@noble/hashes/legacy.js";
import { bytesToHex, utf16leBytes, utf8Bytes } from "./bytes";

async function subtleDigestHex(algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", input: string): Promise<string> {
  const bytes = utf8Bytes(input);
  const digest = await crypto.subtle.digest(algorithm, bytes.buffer as ArrayBuffer);
  return bytesToHex(new Uint8Array(digest));
}

export type HashAlgorithm = {
  id: string;
  name: string;
  compute: (plaintext: string) => Promise<string> | string;
  /** Surfaced by the Hash Generator UI for algorithms with an encoding gotcha. */
  note?: string;
};

/** Single source of truth for every hash this site can compute client-side from a plaintext.
 *  Used by lib/hash/verify.ts (verify a guessed plaintext against a candidate hash type) and
 *  by the Hash Generator tool (compute all requested algorithms directly). MD5 comes from
 *  @noble/hashes (audited, actively maintained); MD4 has no maintained equivalent there, so
 *  it stays on the js-md4 package; SHA-1/256/384/512 use the browser's native Web Crypto API. */
export const HASH_ALGORITHMS: HashAlgorithm[] = [
  { id: "md5", name: "MD5", compute: (pw) => bytesToHex(md5(utf8Bytes(pw))) },
  { id: "md4", name: "MD4", compute: (pw) => md4(utf8Bytes(pw)) },
  {
    id: "ntlm",
    name: "NTLM",
    compute: (pw) => md4(utf16leBytes(pw)),
    note: "NTLM hashes the UTF-16LE encoding of the input, not UTF-8 — this is why it differs from a plain MD4 of the same text.",
  },
  { id: "sha1", name: "SHA-1", compute: (pw) => subtleDigestHex("SHA-1", pw) },
  { id: "sha224", name: "SHA-224", compute: (pw) => bytesToHex(sha224(utf8Bytes(pw))) },
  { id: "sha256", name: "SHA-256", compute: (pw) => subtleDigestHex("SHA-256", pw) },
  { id: "sha384", name: "SHA-384", compute: (pw) => subtleDigestHex("SHA-384", pw) },
  { id: "sha512", name: "SHA-512", compute: (pw) => subtleDigestHex("SHA-512", pw) },
  { id: "sha3-256", name: "SHA3-256", compute: (pw) => bytesToHex(sha3_256(utf8Bytes(pw))) },
  { id: "ripemd160", name: "RIPEMD-160", compute: (pw) => bytesToHex(ripemd160(utf8Bytes(pw))) },
];

export const HASH_ALGORITHMS_BY_ID: Record<string, HashAlgorithm> = Object.fromEntries(
  HASH_ALGORITHMS.map((a) => [a.id, a]),
);
