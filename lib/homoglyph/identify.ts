import { ASCII_SEQUENCE_ENTRIES, ASCII_SEQUENCE_SOURCES, SOURCE_MAP, toCodePointHex } from "./data";
import { getScriptName } from "./scripts";

export type FlaggedChar = {
  /** Index into the code-point array (`Array.from(text)`), not the raw UTF-16 string index. */
  index: number;
  char: string;
  codePoint: string;
  script: string;
  impersonates: string;
  impersonatesCodePoints: string[];
};

/** Scans text code point by code point (so surrogate pairs aren't split) and flags any
 *  character present as a source in the Unicode Consortium's confusables.txt mapping. Also
 *  checks, at each position, for an ASCII lookalike sequence (e.g. "rn") before falling back
 *  to the single-character check, so the sequence is flagged as impersonating the letter it
 *  reads as, rather than that letter being flagged for appearing elsewhere in the text. */
export function identifyHomoglyphs(text: string): FlaggedChar[] {
  const chars = Array.from(text);
  const flagged: FlaggedChar[] = [];

  let index = 0;
  while (index < chars.length) {
    const sequenceEntry = ASCII_SEQUENCE_ENTRIES.find((entry) => {
      const seqChars = [...entry.sequence];
      return chars.slice(index, index + seqChars.length).join("") === entry.sequence;
    });

    if (sequenceEntry) {
      const seqChars = [...sequenceEntry.sequence];
      flagged.push({
        index,
        char: sequenceEntry.sequence,
        codePoint: seqChars.map(toCodePointHex).join(", "),
        script: getScriptName(seqChars[0]),
        impersonates: sequenceEntry.impersonates,
        impersonatesCodePoints: [...sequenceEntry.impersonates].map(toCodePointHex),
      });
      index += seqChars.length;
      continue;
    }

    const char = chars[index];
    const target = SOURCE_MAP.get(char);
    if (target && !ASCII_SEQUENCE_SOURCES.has(char)) {
      flagged.push({
        index,
        char,
        codePoint: toCodePointHex(char),
        script: getScriptName(char),
        impersonates: target,
        impersonatesCodePoints: [...target].map(toCodePointHex),
      });
    }
    index += 1;
  }

  return flagged;
}
