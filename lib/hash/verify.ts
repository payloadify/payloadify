import { HASH_ALGORITHMS_BY_ID } from "./algorithms";
import { HashCandidate } from "./detect";

export function isVerifiable(signatureId: string): boolean {
  return signatureId in HASH_ALGORITHMS_BY_ID;
}

/** Tries the given plaintext against every candidate this tool can compute, returning the
 *  matching signature id, or null if none of the computable candidates match. */
export async function verifyPlaintext(
  candidates: HashCandidate[],
  hashPart: string,
  plaintext: string,
): Promise<string | null> {
  const target = hashPart.toLowerCase();
  for (const { signature } of candidates) {
    const algorithm = HASH_ALGORITHMS_BY_ID[signature.id];
    if (!algorithm) continue;
    const computed = await algorithm.compute(plaintext);
    if (computed.toLowerCase() === target) return signature.id;
  }
  return null;
}
