import { SINGLE_CHAR_REVERSE_MAP, toCodePointHex } from "./data";
import { getScriptName } from "./scripts";

export type Alternative = {
  char: string;
  codePoint: string;
  script: string;
};

export type Substitution = {
  index: number;
  original: string;
  replacement: string;
};

export type GenerateResult = {
  output: string;
  substitutions: Substitution[];
};

/** Homoglyph alternatives available for a single character, e.g. Latin "a" -> Cyrillic а, etc. */
export function getAlternativesFor(char: string): Alternative[] {
  const sources = SINGLE_CHAR_REVERSE_MAP.get(char);
  if (!sources) return [];
  return sources.map((source) => ({
    char: source,
    codePoint: toCodePointHex(source),
    script: getScriptName(source),
  }));
}

function buildResult(chars: string[], replacements: Map<number, string>): GenerateResult {
  const substitutions: Substitution[] = [];
  const output = chars
    .map((char, index) => {
      const replacement = replacements.get(index);
      if (!replacement) return char;
      substitutions.push({ index, original: char, replacement });
      return replacement;
    })
    .join("");
  return { output, substitutions };
}

/** Swaps every eligible character for a freshly random alternative. */
export function randomizeText(text: string): GenerateResult {
  const chars = Array.from(text);
  const replacements = new Map<number, string>();

  chars.forEach((char, index) => {
    const alternatives = getAlternativesFor(char);
    if (alternatives.length === 0) return;
    const pick = alternatives[Math.floor(Math.random() * alternatives.length)];
    replacements.set(index, pick.char);
  });

  return buildResult(chars, replacements);
}

/** Applies user-picked per-character substitutions (index -> replacement char). */
export function applySelections(text: string, selections: Map<number, string>): GenerateResult {
  const chars = Array.from(text);
  return buildResult(chars, selections);
}
