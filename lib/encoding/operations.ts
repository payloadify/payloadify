import { utf8Bytes, utf16leBytes, bytesToHex } from "../hash/bytes";
import {
  bytesToBase64,
  base64ToBytes,
  hexToBytes,
  utf16beBytes,
  percentEncodeBytes,
  percentDecodeToBytes,
  resolveAndDecodeText,
} from "./bytes";
export type EncodingOperationId = "base64" | "hex" | "url" | "html-entity" | "unicode-escape";

export type OperationOptions = { mode?: string; charset?: string };

export type EncodingOperation = {
  id: EncodingOperationId;
  name: string;
  /** Only present for operations with a configurable encode mode (drives a per-step toggle in the UI). */
  modes?: { id: string; label: string }[];
  /** base64, hex, url only — these are genuinely byte-oriented; html-entity/unicode-escape operate
   *  on Unicode code points/units, not bytes in an external charset, so charset doesn't apply. */
  supportsCharset?: boolean;
  /** base64, hex, url, html-entity only (not unicode-escape) — gates decode-each-line AND the
   *  encode-side "encode each line separately" / chunk-width / newline-separator options, since
   *  both directions' line handling apply to the same 4 operations. */
  supportsLineOptions?: boolean;
  encode: (input: string, options?: OperationOptions) => string;
  decode: (input: string, options?: OperationOptions) => string;
};

/** Only UTF-8/UTF-16LE/UTF-16BE are reachable here — TextEncoder (and therefore this whole
 *  tool) can only ever produce UTF-8 bytes natively; encode-direction charset selection is
 *  limited to these 3 in the UI, so no other branch is possible. */
function charsetToBytes(input: string, charset: string | undefined): Uint8Array {
  switch (charset) {
    case "utf-16le":
      return utf16leBytes(input);
    case "utf-16be":
      return utf16beBytes(input);
    default:
      return utf8Bytes(input);
  }
}

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const RESERVED_HTML_CHARS: Record<string, string> = {
  "&": "amp",
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "apos",
};

function htmlEntityEncode(input: string, mode: string | undefined): string {
  if (mode === "reserved-only") {
    return input.replace(/[&<>"']/g, (ch) => `&${RESERVED_HTML_CHARS[ch]};`);
  }
  return Array.from(input, (ch) => `&#${ch.codePointAt(0)};`).join("");
}

function htmlEntityDecode(input: string): string {
  return input.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (Number.isNaN(codePoint)) throw new Error(`Invalid numeric HTML entity: ${match}`);
      return String.fromCodePoint(codePoint);
    }
    const resolved = NAMED_HTML_ENTITIES[entity];
    if (resolved === undefined) throw new Error(`Unknown named HTML entity: ${match}`);
    return resolved;
  });
}

function unicodeEscapeEncode(input: string, mode: string | undefined): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (mode === "non-ascii-only" && code < 128) {
      out += input[i];
    } else {
      out += "\\u" + code.toString(16).padStart(4, "0");
    }
  }
  return out;
}

function unicodeEscapeDecode(input: string): string {
  if (!/^(\\u[0-9a-fA-F]{4})*$/.test(input)) {
    throw new Error("Invalid Unicode escape — expected a sequence of \\uXXXX groups.");
  }
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

/** Single source of truth for every encode/decode operation the Payload Encoder can chain. */
export const ENCODING_OPERATIONS: EncodingOperation[] = [
  {
    id: "base64",
    name: "Base64",
    supportsCharset: true,
    supportsLineOptions: true,
    encode: (input, options) => bytesToBase64(charsetToBytes(input, options?.charset)),
    decode: (input, options) => resolveAndDecodeText(base64ToBytes(input), options?.charset),
  },
  {
    id: "hex",
    name: "Hex",
    supportsCharset: true,
    supportsLineOptions: true,
    encode: (input, options) => bytesToHex(charsetToBytes(input, options?.charset)),
    decode: (input, options) => resolveAndDecodeText(hexToBytes(input), options?.charset),
  },
  {
    id: "url",
    name: "URL",
    supportsCharset: true,
    supportsLineOptions: true,
    encode: (input, options) => percentEncodeBytes(charsetToBytes(input, options?.charset)),
    decode: (input, options) => resolveAndDecodeText(percentDecodeToBytes(input), options?.charset),
  },
  {
    id: "html-entity",
    name: "HTML Entity",
    modes: [
      { id: "all", label: "Encode every character" },
      { id: "reserved-only", label: "Reserved characters only (& < > \" ')" },
    ],
    supportsLineOptions: true,
    encode: (input, options) => htmlEntityEncode(input, options?.mode),
    decode: (input) => htmlEntityDecode(input),
  },
  {
    id: "unicode-escape",
    name: "Unicode Escape",
    modes: [
      { id: "all", label: "Escape every character" },
      { id: "non-ascii-only", label: "Non-ASCII characters only" },
    ],
    encode: (input, options) => unicodeEscapeEncode(input, options?.mode),
    decode: (input) => unicodeEscapeDecode(input),
  },
];

export const ENCODING_OPERATIONS_BY_ID: Record<string, EncodingOperation> = Object.fromEntries(
  ENCODING_OPERATIONS.map((op) => [op.id, op]),
);
