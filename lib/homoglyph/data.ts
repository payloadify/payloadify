import confusablesRaw from "./confusables.json";

/** source character -> confusable target sequence (1+ code points), from the Unicode
 *  Consortium's confusables.txt. Source is always exactly one code point. */
export const SOURCE_MAP: Map<string, string> = new Map(confusablesRaw as [string, string][]);

/** target character -> source alternatives, restricted to entries where the target is also
 *  exactly one code point. Multi-code-point targets are excluded here because Generate mode
 *  substitutes one input character for one lookalike, keeping the output the same length. */
export const SINGLE_CHAR_REVERSE_MAP: Map<string, string[]> = (() => {
  const reverse = new Map<string, string[]>();
  for (const [source, target] of SOURCE_MAP) {
    if ([...target].length !== 1) continue;
    const existing = reverse.get(target);
    if (existing) existing.push(source);
    else reverse.set(target, [source]);
  }
  return reverse;
})();

export function toCodePointHex(char: string): string {
  return `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`;
}

const BASIC_LATIN_ALNUM = /^[A-Za-z0-9]+$/;

/** Confusables where an ordinary Basic Latin letter is the *source* and a short sequence of
 *  ordinary Basic Latin letters is the *target* (e.g. source "m" -> target "rn"). These describe
 *  a lookalike sequence, not a suspicious character: "m" is a completely normal letter and should
 *  never be flagged on its own, while "rn" is the thing that visually impersonates "m" in text.
 *  Kept separate from SOURCE_MAP's per-character scan, which flags "rn"'s components as normal
 *  Basic Latin letters. */
export const ASCII_SEQUENCE_ENTRIES: { sequence: string; impersonates: string }[] = (() => {
  const entries: { sequence: string; impersonates: string }[] = [];
  for (const [source, target] of SOURCE_MAP) {
    if ([...target].length < 2) continue;
    if (!BASIC_LATIN_ALNUM.test(source) || !BASIC_LATIN_ALNUM.test(target)) continue;
    entries.push({ sequence: target, impersonates: source });
  }
  return entries;
})();

/** Source characters covered by ASCII_SEQUENCE_ENTRIES — excluded from the per-character
 *  SOURCE_MAP scan in identify.ts so the plain letter (e.g. "m") is never flagged. */
export const ASCII_SEQUENCE_SOURCES: Set<string> = new Set(ASCII_SEQUENCE_ENTRIES.map((e) => e.impersonates));
