// Ordered list of Unicode scripts to test a character against, using the engine's built-in
// `\p{Script=...}` support (ES2018+, available in all evergreen browsers and Node) instead of
// bundling a second large Unicode data file just to label a character's script of origin.
// Order matters only for scripts that could otherwise overlap in intent (Latin/Common checked
// first since most non-flagged input falls there). Covers every script that appears as a
// confusables.txt source in the current Unicode data, plus a long tail falls back to "Unknown".
const SCRIPT_NAMES = [
  "Latin",
  "Common",
  "Cyrillic",
  "Greek",
  "Armenian",
  "Hebrew",
  "Arabic",
  "Syriac",
  "Thaana",
  "Devanagari",
  "Bengali",
  "Gurmukhi",
  "Gujarati",
  "Oriya",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Sinhala",
  "Thai",
  "Lao",
  "Tibetan",
  "Georgian",
  "Hangul",
  "Hiragana",
  "Katakana",
  "Han",
  "Cherokee",
  "Ethiopic",
  "Coptic",
  "Mongolian",
  "Runic",
  "Ogham",
  "Glagolitic",
  "Old_Italic",
  "Deseret",
  "Tifinagh",
  "Yi",
  "Vai",
  "Bamum",
  "Osmanya",
  "Nko",
  "Balinese",
  "Javanese",
  "Cham",
  "New_Tai_Lue",
  "Lepcha",
  "Ol_Chiki",
  "Bopomofo",
  "Canadian_Aboriginal",
  "Bhaiksuki",
  "Kaithi",
  "Khmer",
  "Modi",
  "Sharada",
  "Siddham",
  "Tirhuta",
  "Grantha",
  "Warang_Citi",
  "Lycian",
  "Kharoshthi",
  "Old_Persian",
  "Old_Hungarian",
  "Miao",
  "Cuneiform",
  "Egyptian_Hieroglyphs",
  "Elbasan",
  "Inherited",
  "Braille",
];

const SCRIPT_TESTERS: { name: string; regex: RegExp }[] = SCRIPT_NAMES.map((name) => ({
  name,
  regex: new RegExp(`\\p{Script=${name}}`, "u"),
}));

const scriptNameCache = new Map<string, string>();

/** Returns the Unicode script name for a single character (code point), e.g. "Cyrillic". */
export function getScriptName(char: string): string {
  const cached = scriptNameCache.get(char);
  if (cached) return cached;

  const match = SCRIPT_TESTERS.find((tester) => tester.regex.test(char));
  const name = match?.name ?? "Unknown";
  scriptNameCache.set(char, name);
  return name;
}
