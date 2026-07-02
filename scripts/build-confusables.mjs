// One-off data build script — not part of the app runtime or `npm run build`.
//
// Fetches the Unicode Consortium's official confusables.txt (UTS #39) and converts it
// into a compact { "sourceChar": "targetChars" } JSON map bundled at lib/homoglyph/confusables.json.
// Re-run manually (`node scripts/build-confusables.mjs`) to pick up a newer Unicode version.
//
// Source: https://www.unicode.org/reports/tr39/#Confusable_Detection

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://www.unicode.org/Public/security/latest/confusables.txt";
const OUTPUT_PATH = fileURLToPath(new URL("../lib/homoglyph/confusables.json", import.meta.url));

function codePointsToString(hexSequence) {
  return hexSequence
    .trim()
    .split(/\s+/)
    .map((hex) => String.fromCodePoint(parseInt(hex, 16)))
    .join("");
}

// JSON.stringify does not escape U+2028/U+2029 (LINE/PARAGRAPH SEPARATOR), and the raw Unicode
// data contains both — left unescaped, bundlers that inline this JSON into a JS module produce
// a syntax error, since those code points are line terminators in JS string literals.
function escapeJsonLineTerminators(json) {
  const lineSeparator = String.fromCharCode(0x2028);
  const paragraphSeparator = String.fromCharCode(0x2029);
  return json.split(lineSeparator).join("\\u2028").split(paragraphSeparator).join("\\u2029");
}

async function main() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();

  // An array of [source, target] pairs, not an object keyed by source character: bundlers'
  // JSON-to-ESM transforms (e.g. Vite's) generate a named export per object key that looks like
  // a valid JS identifier, and single confusable characters can trip that up. Arrays always take
  // the plain `export default` path, sidestepping the issue entirely.
  /** @type {[string, string][]} */
  const pairs = [];

  for (const line of text.split(/\r?\n/)) {
    if (!/^[0-9A-Fa-f]{4,}/.test(line)) continue; // skip comments/blank lines

    const dataPart = line.split("#")[0];
    const [srcHex, tgtHex] = dataPart.split(";");
    if (!srcHex || !tgtHex) continue;

    const source = codePointsToString(srcHex);
    const target = codePointsToString(tgtHex);
    if (source === target) continue;

    pairs.push([source, target]);
  }

  const json = escapeJsonLineTerminators(JSON.stringify(pairs));
  await writeFile(OUTPUT_PATH, json, "utf8");
  console.log(`Wrote ${pairs.length} confusable entries to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
