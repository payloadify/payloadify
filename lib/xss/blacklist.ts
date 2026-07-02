import { XssInjectionType, XssQuote } from "./injectionTypes";
import { Obfuscation } from "./obfuscation";

export const COMMON_BLACKLIST_CHARS: { char: string; label: string }[] = [
  { char: "<", label: "<" },
  { char: ">", label: ">" },
  { char: '"', label: '"' },
  { char: "'", label: "'" },
  { char: "(", label: "(" },
  { char: ")", label: ")" },
  { char: "/", label: "/" },
  { char: "\\", label: "\\" },
  { char: " ", label: "space" },
  { char: ";", label: ";" },
  { char: "=", label: "=" },
];

export type AdaptedPayload = {
  payload: string;
  attrQuote: XssQuote;
  jsQuote: XssQuote;
  /** False when the requested obfuscation doesn't apply to this action expression (e.g.
   *  string-concat/backtick-call need a name(args)-shaped call) and the payload fell back to
   *  the plain, unobfuscated action expression instead. */
  obfuscationApplied: boolean;
  /** Blacklisted characters that still appear in `payload` after trying every quote
   *  combination — empty when a fully clean combination was found. */
  violations: string[];
};

const QUOTES: XssQuote[] = ['"', "'"];

/** Tries every combination of attribute-delimiter quote and JS-string-literal quote (they're
 *  independent — mixing " for the HTML attribute and ' for an inner JS string, or vice versa,
 *  is itself a common filter-bypass trick) and keeps the one with the fewest blacklisted
 *  characters still present, preferring a working (non-fallback) obfuscation when scores tie. */
export function buildAdaptedPayload(
  injectionType: XssInjectionType,
  obfuscation: Obfuscation,
  actionExpr: string,
  blacklist: ReadonlySet<string>,
): AdaptedPayload {
  let best: AdaptedPayload | null = null;

  for (const attrQuote of QUOTES) {
    for (const jsQuote of QUOTES) {
      const obfuscated = obfuscation.apply(actionExpr, jsQuote);
      const obfuscationApplied = obfuscated !== null;
      const finalExpr = obfuscated ?? actionExpr;
      const payload = injectionType.render(finalExpr, attrQuote);
      const violations = [...blacklist].filter((ch) => payload.includes(ch));
      const candidate: AdaptedPayload = { payload, attrQuote, jsQuote, obfuscationApplied, violations };

      if (
        !best ||
        candidate.violations.length < best.violations.length ||
        (candidate.violations.length === best.violations.length &&
          candidate.obfuscationApplied &&
          !best.obfuscationApplied)
      ) {
        best = candidate;
      }

      if (best.violations.length === 0 && best.obfuscationApplied) return best;
    }
  }

  return best!;
}

/** Characters from `candidates` that the given obfuscation always emits, regardless of which
 *  JS-string quote is chosen — i.e. blacklisting them can never actually be honored while this
 *  obfuscation is selected. Used to grey out those checkboxes in the UI so users don't blacklist
 *  a character the current obfuscation structurally can't avoid. */
export function unavoidableChars(
  obfuscation: Obfuscation,
  actionExpr: string,
  candidates: readonly string[] = COMMON_BLACKLIST_CHARS.map((c) => c.char),
): Set<string> {
  const variants = QUOTES.map((quote) => obfuscation.apply(actionExpr, quote) ?? actionExpr);
  const unavoidable = new Set<string>();
  for (const ch of candidates) {
    if (variants.every((v) => v.includes(ch))) unavoidable.add(ch);
  }
  return unavoidable;
}
