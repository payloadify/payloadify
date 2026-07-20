import { HashContextId } from "./context";
import { HashCandidate } from "./detect";

/** Presentation-order sort — never touches the structural confidence tier computed in
 *  lib/hash/detect.ts. Priority: a plaintext-confirmed candidate always wins outright; then a
 *  candidate matching the user-selected source context (if any) is promoted above prevalenceRank
 *  ordering; ties within each tier fall back to prevalenceRank, same as before this existed. */
export function orderCandidates(
  candidates: HashCandidate[],
  options: { confirmedId?: string | null; context?: HashContextId } = {},
): HashCandidate[] {
  const { confirmedId = null, context = "unknown" } = options;

  return [...candidates].sort((a, b) => {
    if (confirmedId) {
      if (a.signature.id === confirmedId) return -1;
      if (b.signature.id === confirmedId) return 1;
    }

    if (context !== "unknown") {
      const aFavored = a.signature.favoredContexts?.includes(context) ? 0 : 1;
      const bFavored = b.signature.favoredContexts?.includes(context) ? 0 : 1;
      if (aFavored !== bFavored) return aFavored - bFavored;
    }

    return a.signature.prevalenceRank - b.signature.prevalenceRank;
  });
}
