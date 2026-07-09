import { bytesToBase64url, base64urlToBytes } from "./base64url";
import { derToPem, pemToDer } from "./pem";
import { DecodedJwt } from "./jwt";
import { ALGORITHMS, AlgSpec, JoseAlg } from "./algorithms";

/** RSA/EC/RSA-PSS signing (RS-family, ES-family, PS-family algs) via native Web Crypto.
 *  Web Crypto's ECDSA sign() already returns the raw fixed-length r||s concatenation
 *  (IEEE P1363), which is exactly what RFC 7518 §3.4 requires for JOSE ES256/384/512 — no
 *  DER conversion needed. This is asserted, not assumed: see asymmetric.test.ts's
 *  cross-verification against `jose`. */

function signingInput(headerB64: string, payloadB64: string): string {
  return `${headerB64}.${payloadB64}`;
}

function assertAsymmetric(spec: AlgSpec): asserts spec is AlgSpec & { hash: NonNullable<AlgSpec["hash"]> } {
  if (spec.family !== "rsa" && spec.family !== "rsa-pss" && spec.family !== "ec") {
    throw new Error(`${spec.alg} is not an asymmetric algorithm`);
  }
}

function generateKeyParams(spec: AlgSpec, modulusLength: 2048 | 3072 | 4096): RsaHashedKeyGenParams | EcKeyGenParams {
  assertAsymmetric(spec);
  if (spec.family === "ec") return { name: "ECDSA", namedCurve: spec.namedCurve! };
  return {
    name: spec.family === "rsa" ? "RSASSA-PKCS1-v1_5" : "RSA-PSS",
    modulusLength,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: spec.hash,
  };
}

function importParams(spec: AlgSpec): RsaHashedImportParams | EcKeyImportParams {
  assertAsymmetric(spec);
  if (spec.family === "ec") return { name: "ECDSA", namedCurve: spec.namedCurve! };
  return { name: spec.family === "rsa" ? "RSASSA-PKCS1-v1_5" : "RSA-PSS", hash: spec.hash };
}

function signVerifyParams(spec: AlgSpec): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  assertAsymmetric(spec);
  if (spec.family === "ec") return { name: "ECDSA", hash: spec.hash };
  if (spec.family === "rsa-pss") return { name: "RSA-PSS", saltLength: spec.pssSaltLength! };
  return "RSASSA-PKCS1-v1_5";
}

export async function generateAsymmetricKeyPair(
  alg: JoseAlg,
  opts?: { modulusLength?: 2048 | 3072 | 4096 },
): Promise<CryptoKeyPair> {
  const spec = ALGORITHMS[alg];
  const keyPair = await crypto.subtle.generateKey(generateKeyParams(spec, opts?.modulusLength ?? 2048), true, [
    "sign",
    "verify",
  ]);
  return keyPair as CryptoKeyPair;
}

export async function signAsymmetric(
  alg: JoseAlg,
  headerB64: string,
  payloadB64: string,
  privateKey: CryptoKey,
): Promise<string> {
  const spec = ALGORITHMS[alg];
  const data = new TextEncoder().encode(signingInput(headerB64, payloadB64));
  const sig = await crypto.subtle.sign(signVerifyParams(spec), privateKey, data);
  return bytesToBase64url(new Uint8Array(sig));
}

export async function verifyAsymmetric(alg: JoseAlg, decoded: DecodedJwt, publicKey: CryptoKey): Promise<boolean> {
  if (!decoded.hasSignature) return false;
  try {
    const spec = ALGORITHMS[alg];
    const signatureBytes = base64urlToBytes(decoded.segments.signature);
    const data = new TextEncoder().encode(signingInput(decoded.segments.header, decoded.segments.payload));
    return await crypto.subtle.verify(signVerifyParams(spec), publicKey, signatureBytes.buffer as ArrayBuffer, data);
  } catch {
    return false;
  }
}

export async function importPrivateKeyPem(pem: string, alg: JoseAlg): Promise<CryptoKey> {
  const { label, der } = pemToDer(pem);
  if (label !== "PRIVATE KEY") throw new Error(`Expected a "PRIVATE KEY" PEM block, got "${label}"`);
  return crypto.subtle.importKey("pkcs8", der, importParams(ALGORITHMS[alg]), true, ["sign"]);
}

export async function importPublicKeyPem(pem: string, alg: JoseAlg): Promise<CryptoKey> {
  const { label, der } = pemToDer(pem);
  if (label !== "PUBLIC KEY") throw new Error(`Expected a "PUBLIC KEY" PEM block, got "${label}"`);
  return crypto.subtle.importKey("spki", der, importParams(ALGORITHMS[alg]), true, ["verify"]);
}

export async function exportKeyPairPem(keyPair: CryptoKeyPair): Promise<{ publicPem: string; privatePem: string }> {
  const [publicDer, privateDer] = await Promise.all([
    crypto.subtle.exportKey("spki", keyPair.publicKey),
    crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
  ]);
  return { publicPem: derToPem("PUBLIC KEY", publicDer), privatePem: derToPem("PRIVATE KEY", privateDer) };
}
