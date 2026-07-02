import { AUTO_DETECT_CHARSET, DEFAULT_CHARSET, detectCharset } from "./charsets";

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("Invalid Base64 — contains characters outside the standard Base64 alphabet.");
  }
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().replace(/^0x/i, "").replace(/\s+/g, "");
  if (clean.length === 0) return new Uint8Array(0);
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("Invalid hex — expected an even number of hex digits (0-9, a-f).");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function utf16beBytes(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < input.length; i++) {
    view.setUint16(i * 2, input.charCodeAt(i), false);
  }
  return bytes;
}

/** Matches encodeURIComponent's exact unreserved set so default-charset (UTF-8) output stays
 *  byte-identical to the previous encodeURIComponent-based implementation. */
const URL_UNRESERVED = /[A-Za-z0-9\-_.!~*'()]/;

export function percentEncodeBytes(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) {
    const ch = String.fromCharCode(b);
    out += b < 128 && URL_UNRESERVED.test(ch) ? ch : "%" + b.toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}

export function percentDecodeToBytes(input: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "%") {
      const hex = input.slice(i + 1, i + 3);
      if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
        throw new Error("Invalid URL encoding — contains a malformed % escape sequence.");
      }
      bytes.push(parseInt(hex, 16));
      i += 2;
    } else {
      const code = input.charCodeAt(i);
      if (code >= 128) {
        throw new Error("Invalid URL encoding — contains a literal non-ASCII character outside of a %XX escape.");
      }
      bytes.push(code);
    }
  }
  return Uint8Array.from(bytes);
}

/** fatal: true so invalid byte sequences for the given charset throw instead of silently
 *  becoming U+FFFD replacement characters — a security tool shouldn't hide data corruption. */
export function decodeBytesWithCharset(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset, { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`These bytes are not valid ${charset} text.`);
  }
}

/** Shared by every decode operation's charset handling — resolves the "auto" sentinel via
 *  detectCharset() before decoding, or throws a clear error if detection came up empty,
 *  instead of each operation (base64/hex/url) duplicating this branch. */
export function resolveAndDecodeText(bytes: Uint8Array, charset: string | undefined): string {
  if (charset === AUTO_DETECT_CHARSET) {
    const detected = detectCharset(bytes);
    if (detected === null) {
      throw new Error("Couldn't confidently auto-detect the character encoding — please pick one manually.");
    }
    return decodeBytesWithCharset(bytes, detected);
  }
  return decodeBytesWithCharset(bytes, charset ?? DEFAULT_CHARSET);
}
