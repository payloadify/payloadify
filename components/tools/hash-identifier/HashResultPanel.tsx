import Link from "next/link";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { HASH_CONTEXTS_BY_ID, HashContextId } from "@/lib/hash/context";
import { HashCandidate, HashDetectionResult } from "@/lib/hash/detect";
import { orderCandidates } from "@/lib/hash/rank";

const CONFIDENCE_STYLES: Record<"high" | "medium" | "low", string> = {
  high: "text-green-700 dark:text-green-400",
  medium: "text-amber-700 dark:text-amber-400",
  low: "text-zinc-500 dark:text-zinc-400",
};

/** context !== "unknown" means the user told us where the hash came from — give a concrete
 *  statement of what that did to the ordering, rather than the generic "context matters" nudge
 *  shown when they haven't picked one yet. Structural ambiguity is still real either way; this
 *  is a strong practical hint, not a claim of certainty (hence "no longer just a guess", not
 *  "confirmed" — plaintext verification above is the only thing that actually confirms). */
function getContextHint(candidateIds: string[], context: HashContextId, topCandidateName: string): string | null {
  if (context !== "unknown") {
    return `Because you selected "${HASH_CONTEXTS_BY_ID[context].label}" as the source, ${topCandidateName} is shown first. This is a strong practical hint, not proof. Plaintext verification above is the only thing that fully confirms it.`;
  }
  if (candidateIds.includes("ntlm") && candidateIds.includes("md5")) {
    return "Context matters. If this hash came from a Windows SAM/NTDS dump, it's likely NTLM. If from a generic web app, database, or Unix system, MD5 is far more likely. Pick a source above to reorder these candidates accordingly.";
  }
  return "Context matters: where the hash came from (which system, which app) is often the best way to narrow this down further. Pick a source above, or use plaintext verification if you have a candidate password.";
}

function CandidateRow({
  signature,
  confidence,
  isConfirmed,
  matchesContext,
  hashValue,
}: {
  signature: HashCandidate["signature"];
  confidence: HashCandidate["confidence"];
  isConfirmed: boolean;
  matchesContext: boolean;
  hashValue: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{signature.name}</span>
        <span className="flex items-center gap-2">
          {matchesContext && !isConfirmed && (
            <span className="text-xs uppercase tracking-wide text-green-700 dark:text-green-400">
              matches selected source
            </span>
          )}
          <span
            className={`text-xs uppercase tracking-wide ${
              isConfirmed ? "text-green-700 dark:text-green-400" : CONFIDENCE_STYLES[confidence]
            }`}
          >
            {isConfirmed ? "confirmed" : `${confidence} confidence`}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        {signature.hashcatModes.length > 0 ? (
          <>
            <span>
              Hashcat mode{signature.hashcatModes.length > 1 ? "s" : ""}:{" "}
              <code>{signature.hashcatModes.join(", ")}</code>
            </span>
            <CopyButton text={signature.hashcatModes.join(",")} label="Copy mode" />
            <Link
              href={`/hashcat-command-builder?mode=${signature.hashcatModes[0]}&hash=${encodeURIComponent(hashValue)}`}
              className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
            >
              Build Hashcat Command
            </Link>
          </>
        ) : (
          <span>No Hashcat mode</span>
        )}
      </div>
      {signature.note && <p className="text-sm text-zinc-500 dark:text-zinc-400">{signature.note}</p>}
    </div>
  );
}

export function HashResultPanel({
  result,
  confirmedId = null,
  context = "unknown",
}: {
  result: HashDetectionResult;
  confirmedId?: string | null;
  context?: HashContextId;
}) {
  if (result.kind === "empty") {
    return <Callout variant="info">Enter a hash above and click Submit to identify it.</Callout>;
  }

  if (result.kind === "no-match") {
    return (
      <Callout variant="warning">
        {result.hint ??
          "No known hash pattern matched. Check for extra whitespace, or this may be a proprietary or uncommon format not in this tool's signature list."}
      </Callout>
    );
  }

  const ordered = orderCandidates(result.candidates, { confirmedId, context });

  const [topCandidate, ...restCandidates] = ordered;
  const isAmbiguous = ordered.length > 1;
  // The hashcat-ready target string: hashPart plus the separately-detected colon-salt, if any.
  // Structured crypt formats (bcrypt, sha256crypt, etc.) already carry their salt embedded in
  // hashPart itself, so result.salt stays null for those and nothing is appended here.
  const hashValue = result.salt ? `${result.hashPart}:${result.salt}` : result.hashPart;

  return (
    <div className="flex flex-col gap-3">
      {confirmedId && (
        <Callout variant="success">
          Confirmed by matching the provided plaintext. No longer ambiguous.
        </Callout>
      )}

      {result.salt && (
        <Callout variant="info">
          Detected a <code>hash:salt</code> format; salt <code>{result.salt}</code> was separated
          from the hash before identification.
        </Callout>
      )}

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {confirmedId ? "Confirmed" : isAmbiguous ? "Most likely" : "Identified as"}
        </p>
        <div className="rounded border border-zinc-200 dark:border-zinc-800">
          <CandidateRow
            signature={topCandidate.signature}
            confidence={topCandidate.confidence}
            isConfirmed={topCandidate.signature.id === confirmedId}
            matchesContext={context !== "unknown" && Boolean(topCandidate.signature.favoredContexts?.includes(context))}
            hashValue={hashValue}
          />
        </div>
      </div>

      {restCandidates.length > 0 && !confirmedId && (
        <details className="rounded border border-zinc-200 dark:border-zinc-800">
          <summary className="cursor-pointer p-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Also structurally possible ({restCandidates.length})
          </summary>
          <div className="flex flex-col divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {restCandidates.map(({ signature, confidence }) => (
              <CandidateRow
                key={signature.id}
                signature={signature}
                confidence={confidence}
                isConfirmed={false}
                matchesContext={context !== "unknown" && Boolean(signature.favoredContexts?.includes(context))}
                hashValue={hashValue}
              />
            ))}
          </div>
        </details>
      )}

      {isAmbiguous && !confirmedId && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {getContextHint(ordered.map((c) => c.signature.id), context, topCandidate.signature.name)}
        </p>
      )}
    </div>
  );
}
