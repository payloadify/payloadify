import { base64urlDecodeText, base64urlToBytes, textToBase64url, bytesToBase64url } from "./base64url";
import { COMMON_WEAK_SECRETS } from "./weakSecrets";

export type SegmentResult = {
  raw: string;
  text: string | null;
  json: unknown | null;
  error: string | null;
};

export type DecodedJwt = {
  raw: string;
  segments: { header: string; payload: string; signature: string };
  header: SegmentResult;
  payload: SegmentResult;
  alg: string | null;
  isAlgNone: boolean;
  hasSignature: boolean;
};

export type ParseError = { error: string };

function decodeSegment(raw: string): SegmentResult {
  try {
    const text = base64urlDecodeText(raw);
    try {
      return { raw, text, json: JSON.parse(text), error: null };
    } catch {
      // Valid base64url but not JSON — show the raw decoded text instead of failing outright.
      return { raw, text, json: null, error: "Decoded content is not valid JSON" };
    }
  } catch {
    return { raw, text: null, json: null, error: "Not valid base64url" };
  }
}

export function decodeJwt(rawToken: string): DecodedJwt | ParseError {
  const token = rawToken.trim().replace(/^Bearer\s+/i, "");
  const parts = token.split(".");

  if (parts.length !== 3) {
    return { error: `Expected 3 dot-separated segments (header.payload.signature), found ${parts.length}` };
  }

  const [headerRaw, payloadRaw, signatureRaw] = parts;
  if (headerRaw.length === 0 || payloadRaw.length === 0) {
    return { error: "Header and payload segments cannot be empty" };
  }
  const header = decodeSegment(headerRaw);
  const payload = decodeSegment(payloadRaw);

  const algValue =
    header.json && typeof header.json === "object" && header.json !== null && "alg" in header.json
      ? (header.json as { alg?: unknown }).alg
      : null;
  const alg = typeof algValue === "string" ? algValue : null;

  return {
    raw: token,
    segments: { header: headerRaw, payload: payloadRaw, signature: signatureRaw },
    header,
    payload,
    alg,
    isAlgNone: alg !== null && alg.toLowerCase() === "none",
    hasSignature: signatureRaw.length > 0,
  };
}

function signingInput(headerB64: string, payloadB64: string): string {
  return `${headerB64}.${payloadB64}`;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signHS256(headerB64: string, payloadB64: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput(headerB64, payloadB64)));
  return bytesToBase64url(new Uint8Array(sig));
}

export async function verifyHS256(decoded: DecodedJwt, secret: string): Promise<boolean> {
  if (!decoded.hasSignature || secret.length === 0) return false;
  try {
    const key = await hmacKey(secret);
    const signatureBytes = base64urlToBytes(decoded.segments.signature);
    const data = new TextEncoder().encode(signingInput(decoded.segments.header, decoded.segments.payload));
    return await crypto.subtle.verify("HMAC", key, signatureBytes.buffer as ArrayBuffer, data);
  } catch {
    return false;
  }
}

/** Tries a small wordlist of known-weak/default HMAC secrets. Not a brute-force attack — just common defaults. */
export async function findWeakSecret(decoded: DecodedJwt): Promise<string | null> {
  if (!decoded.alg || !decoded.alg.toUpperCase().startsWith("HS")) return null;
  for (const candidate of COMMON_WEAK_SECRETS) {
    if (await verifyHS256(decoded, candidate)) return candidate;
  }
  return null;
}

/** Parses JSON and requires the result to be a plain object, so callers can safely set fields on it. */
export function parseJsonObject(text: string, label: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    const kind = parsed === null ? "null" : Array.isArray(parsed) ? "an array" : typeof parsed;
    throw new Error(`${label} must be a JSON object, not ${kind}`);
  }
  return parsed as Record<string, unknown>;
}

/** Re-signs edited header/payload JSON as HS256 with the given secret. */
export async function reSignHS256(headerJson: string, payloadJson: string, secret: string): Promise<string> {
  const parsedHeader = parseJsonObject(headerJson, "Header");
  parsedHeader.alg = "HS256";
  const parsedPayload = parseJsonObject(payloadJson, "Payload");
  const headerB64 = textToBase64url(JSON.stringify(parsedHeader));
  const payloadB64 = textToBase64url(JSON.stringify(parsedPayload));
  const signature = await signHS256(headerB64, payloadB64, secret);
  return `${headerB64}.${payloadB64}.${signature}`;
}

/** Produces the classic alg:none bypass token — valid header/payload, empty signature. */
export function stripToAlgNone(headerJson: string, payloadJson: string): string {
  const parsedHeader = parseJsonObject(headerJson, "Header");
  parsedHeader.alg = "none";
  const parsedPayload = parseJsonObject(payloadJson, "Payload");
  const headerB64 = textToBase64url(JSON.stringify(parsedHeader));
  const payloadB64 = textToBase64url(JSON.stringify(parsedPayload));
  return `${headerB64}.${payloadB64}.`;
}

export type ClaimTimeStatus = { label: string; value: number; iso: string; status: "past" | "future" };

export function describeClaimTimestamp(claims: Record<string, unknown>, key: string): ClaimTimeStatus | null {
  const value = claims[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const ms = value * 1000;
  const date = new Date(ms);
  const nowMs = Date.now();
  return {
    label: key,
    value,
    iso: date.toISOString(),
    status: ms <= nowMs ? "past" : "future",
  };
}
