/** PEM (base64 + BEGIN/END headers) encode/decode for RSA/EC keys.
 *  Uses standard base64 (not base64url.ts's alphabet — PEM requires "+/=", JWT segments
 *  require "-_" with no padding, these are not interchangeable). */

const PEM_LINE_LENGTH = 64;

export type PemLabel = "PUBLIC KEY" | "PRIVATE KEY";

const UNSUPPORTED_FORMAT_LABELS = new Set([
  "RSA PUBLIC KEY",
  "RSA PRIVATE KEY",
  "EC PRIVATE KEY",
  "EC PARAMETERS",
  "DSA PRIVATE KEY",
  "ENCRYPTED PRIVATE KEY",
]);

export function derToPem(label: PemLabel, der: ArrayBuffer): string {
  const bytes = new Uint8Array(der);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += PEM_LINE_LENGTH) {
    lines.push(base64.slice(i, i + PEM_LINE_LENGTH));
  }
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

export function pemToDer(pem: string): { label: string; der: ArrayBuffer } {
  const match = pem.trim().match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/);
  if (!match) {
    throw new Error("Not a valid PEM block (missing -----BEGIN/END----- markers)");
  }
  const label = match[1].trim();
  if (UNSUPPORTED_FORMAT_LABELS.has(label)) {
    throw new Error(
      `"${label}" is in PKCS#1/SEC1 format, which the browser's Web Crypto API can't import directly. ` +
        `Convert it to PKCS#8 first, e.g. "openssl pkcs8 -topk8 -nocrypt -in key.pem -out key-pkcs8.pem" ` +
        `(for private keys), then paste the converted PEM.`,
    );
  }
  if (label !== "PUBLIC KEY" && label !== "PRIVATE KEY") {
    throw new Error(`Unrecognized PEM block type "${label}" — expected "PUBLIC KEY" or "PRIVATE KEY" (PKCS#8/SPKI).`);
  }
  const base64 = match[2].replace(/\s+/g, "");
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("PEM body is not valid base64");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { label, der: bytes.buffer };
}
