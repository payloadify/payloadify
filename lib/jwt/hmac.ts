import { bytesToBase64url, base64urlToBytes } from "./base64url";
import { DecodedJwt } from "./jwt";
import { ALGORITHMS, HashName } from "./algorithms";

/** Generalized HMAC signing (HS256/384/512) — parallel to jwt.ts's signHS256/verifyHS256,
 *  which stay hardcoded to SHA-256 so the shipped Decoder's behavior never changes. */

function signingInput(headerB64: string, payloadB64: string): string {
  return `${headerB64}.${payloadB64}`;
}

async function hmacKey(secret: string, hash: HashName): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash }, false, [
    "sign",
    "verify",
  ]);
}

export async function signHmac(
  alg: "HS256" | "HS384" | "HS512",
  headerB64: string,
  payloadB64: string,
  secret: string,
): Promise<string> {
  const hash = ALGORITHMS[alg].hash!;
  const key = await hmacKey(secret, hash);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput(headerB64, payloadB64)));
  return bytesToBase64url(new Uint8Array(sig));
}

export async function verifyHmac(alg: "HS256" | "HS384" | "HS512", decoded: DecodedJwt, secret: string): Promise<boolean> {
  if (!decoded.hasSignature || secret.length === 0) return false;
  try {
    const hash = ALGORITHMS[alg].hash!;
    const key = await hmacKey(secret, hash);
    const signatureBytes = base64urlToBytes(decoded.segments.signature);
    const data = new TextEncoder().encode(signingInput(decoded.segments.header, decoded.segments.payload));
    return await crypto.subtle.verify("HMAC", key, signatureBytes.buffer as ArrayBuffer, data);
  } catch {
    return false;
  }
}
