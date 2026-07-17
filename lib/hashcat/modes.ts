import { HASH_SIGNATURES } from "../hash/signatures";

export type HashcatMode = {
  mode: number;
  name: string;
};

/** Derived from the Hash Identifier's own signature database rather than a separate hardcoded
 *  list — a hash type added there (with a hashcatModes entry) automatically appears here too, so
 *  the identifier and this builder can never drift out of sync. Dedupes defensively in case two
 *  signatures ever share the same mode number. */
function buildModesList(): HashcatMode[] {
  const byMode = new Map<number, string>();
  for (const signature of HASH_SIGNATURES) {
    for (const mode of signature.hashcatModes) {
      if (!byMode.has(mode)) byMode.set(mode, signature.name);
    }
  }
  return Array.from(byMode, ([mode, name]) => ({ mode, name })).sort((a, b) => a.mode - b.mode);
}

export const HASHCAT_MODES: HashcatMode[] = buildModesList();

export const HASHCAT_MODES_BY_NUMBER: Record<number, HashcatMode> = Object.fromEntries(
  HASHCAT_MODES.map((m) => [m.mode, m]),
);
