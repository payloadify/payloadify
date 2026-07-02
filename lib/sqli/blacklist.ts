import { SqliContext } from "./context";
import { SqlDialect } from "./dialects";
import { SqliObfuscation } from "./obfuscation";
import { SqliTechnique } from "./techniques";

export const COMMON_BLACKLIST_CHARS: { char: string; label: string }[] = [
  { char: "'", label: "'" },
  { char: "(", label: "(" },
  { char: ")", label: ")" },
  { char: "=", label: "=" },
  { char: ";", label: ";" },
  { char: "#", label: "#" },
  { char: "--", label: "--" }, // the meaningful unit is the 2-char comment sequence, not a lone hyphen
  { char: ",", label: "," }, // relevant to UNION column lists / CONCAT argument lists
  { char: "`", label: "`" }, // MySQL identifier quoting
  { char: " ", label: "space" },
];

/** The only quote role relevant to SQL-injection breakout. Unlike XSS's independent
 *  attribute-quote/JS-string-quote pair, all 5 target dialects use a single-quote as the string
 *  literal delimiter — double-quote is never a value delimiter, only sometimes an identifier
 *  delimiter — so there's no quote-combination matrix to search here, unlike lib/xss/blacklist.ts. */
const QUOTE = "'";

export type AdaptedSqliPayload = {
  payload: string;
  obfuscationApplied: boolean;
  violations: string[];
};

/** Combines a technique, obfuscation, dialect, and extraction expression into a final payload,
 *  reporting any blacklisted characters that remain. Callers must only pass a (technique, dialect)
 *  pair whose `render` is actually supported — see lib/sqli/generate.ts's
 *  pickTechniqueAndObfuscation, which filters for this before ever calling here. */
export function buildAdaptedPayload(
  technique: SqliTechnique,
  obfuscation: SqliObfuscation,
  dialect: SqlDialect,
  infoExpr: string | null,
  context: SqliContext,
  columnCount: number,
  blacklist: ReadonlySet<string>,
): AdaptedSqliPayload {
  let finalExpr = infoExpr;
  let obfuscationApplied = false;

  if (technique.usesInfoExpr && infoExpr !== null) {
    const obfuscated = obfuscation.apply(infoExpr, dialect, QUOTE);
    obfuscationApplied = obfuscated !== null;
    finalExpr = obfuscated ?? infoExpr;
  }

  const payload = technique.render(dialect, finalExpr, QUOTE, context, columnCount);
  if (payload === null) {
    throw new Error(`Technique "${technique.id}" is not supported on dialect "${dialect.id}".`);
  }

  const violations = [...blacklist].filter((ch) => payload.includes(ch));
  return { payload, obfuscationApplied, violations };
}

/** Characters from `candidates` that the given obfuscation still emits when applied to
 *  `infoExpr` — i.e. blacklisting them can never actually be honored while this obfuscation is
 *  selected. Used to grey out those checkboxes in the UI. Only reasons about the
 *  obfuscation+infoExpr, not the surrounding technique template, mirroring the same scope
 *  lib/xss/blacklist.ts's unavoidableChars uses. */
export function unavoidableChars(
  obfuscation: SqliObfuscation,
  dialect: SqlDialect,
  infoExpr: string | null,
  candidates: readonly string[] = COMMON_BLACKLIST_CHARS.map((c) => c.char),
): Set<string> {
  const unavoidable = new Set<string>();
  if (infoExpr === null) return unavoidable;
  const obfuscated = obfuscation.apply(infoExpr, dialect, QUOTE) ?? infoExpr;
  for (const ch of candidates) {
    if (obfuscated.includes(ch)) unavoidable.add(ch);
  }
  return unavoidable;
}
