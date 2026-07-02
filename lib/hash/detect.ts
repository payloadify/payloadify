import { HASH_SIGNATURES, HashSignature } from "./signatures";

export type HashCandidate = {
  signature: HashSignature;
  confidence: "high" | "medium" | "low";
};

export type HashDetectionResult =
  | { kind: "empty" }
  | { kind: "no-match"; hint: string | null }
  | {
      kind: "matched";
      hashPart: string;
      candidates: HashCandidate[];
      ambiguityNote: string | null;
      salt: string | null;
    };

/** Peels off a `hash:salt` suffix, but only when the part before the colon independently
 *  looks like a bare hex hash — crypt formats like `$6$salt$hash` contain no bare `:` and
 *  must never be split. */
function splitSalt(input: string): { hashPart: string; salt: string | null } {
  const firstColon = input.indexOf(":");
  const lastColon = input.lastIndexOf(":");
  if (firstColon === -1 || firstColon !== lastColon) return { hashPart: input, salt: null };

  const candidate = input.slice(0, firstColon);
  if (!/^[0-9a-f]+$/i.test(candidate)) return { hashPart: input, salt: null };

  return { hashPart: candidate, salt: input.slice(firstColon + 1) };
}

// Lengths this tool has a hex-based signature for. Used only to give a more specific
// "wrong character set" hint than a generic no-match message when a string is the right
// length for a known hash type but contains non-hex characters.
const KNOWN_HEX_LENGTHS = [16, 32, 40, 56, 64, 96, 128];

function buildNoMatchHint(hashPart: string): string | null {
  if (/^\$2/.test(hashPart)) {
    return "This looks like it might be a bcrypt hash (starts with $2), but it doesn't match the expected $2a$/$2b$/$2y$ + cost + 53-character format.";
  }
  if (KNOWN_HEX_LENGTHS.includes(hashPart.length) && !/^[0-9a-f]+$/i.test(hashPart)) {
    return `This is ${hashPart.length} characters — a common length for a hex-encoded hash — but it contains characters outside 0-9a-f, so it can't be identified as a hex hash.`;
  }
  return null;
}

export function identifyHash(rawInput: string): HashDetectionResult {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) return { kind: "empty" };

  const { hashPart, salt } = splitSalt(trimmed);
  const matches = HASH_SIGNATURES.filter((sig) => sig.test(hashPart));

  if (matches.length === 0) return { kind: "no-match", hint: buildNoMatchHint(hashPart) };

  matches.sort((a, b) => b.specificity - a.specificity);

  if (matches.length === 1) {
    return {
      kind: "matched",
      hashPart,
      candidates: [{ signature: matches[0], confidence: "high" }],
      ambiguityNote: null,
      salt,
    };
  }

  const maxSpecificity = matches[0].specificity;
  const allTied = matches.every((m) => m.specificity === maxSpecificity);

  const candidates: HashCandidate[] = matches.map((signature) => ({
    signature,
    confidence: allTied ? "low" : signature.specificity === maxSpecificity ? "medium" : "low",
  }));

  const ambiguityNote = allTied
    ? `${hashPart.length} hex characters — this length is shared by ${matches.map((m) => m.name).join(", ")}. Check each candidate's note below for context.`
    : null;

  return { kind: "matched", hashPart, candidates, ambiguityNote, salt };
}
