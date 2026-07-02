import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { HashCandidate, HashDetectionResult } from "@/lib/hash/detect";

const CONFIDENCE_STYLES: Record<"high" | "medium" | "low", string> = {
  high: "text-green-700 dark:text-green-400",
  medium: "text-amber-700 dark:text-amber-400",
  low: "text-zinc-500 dark:text-zinc-400",
};

function getContextHint(candidateIds: string[]): string | null {
  if (candidateIds.includes("ntlm") && candidateIds.includes("md5")) {
    return "Context matters — if this hash came from a Windows SAM/NTDS dump, it's likely NTLM. If from a generic web app, database, or Unix system, MD5 is far more likely.";
  }
  return "Context matters — where the hash came from (which system, which app) is often the best way to narrow this down further. If you have a candidate password, use plaintext verification above to confirm the exact type.";
}

function CandidateRow({
  signature,
  confidence,
  isConfirmed,
}: {
  signature: HashCandidate["signature"];
  confidence: HashCandidate["confidence"];
  isConfirmed: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{signature.name}</span>
        <span
          className={`text-xs uppercase tracking-wide ${
            isConfirmed ? "text-green-700 dark:text-green-400" : CONFIDENCE_STYLES[confidence]
          }`}
        >
          {isConfirmed ? "confirmed" : `${confidence} confidence`}
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
}: {
  result: HashDetectionResult;
  confirmedId?: string | null;
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

  // Ordering shown to the user is driven purely by real-world prevalence (prevalenceRank),
  // completely separate from the structural confidence tier computed in lib/hash/detect.ts.
  // A plaintext-confirmed candidate always wins regardless of prevalence.
  const ordered = [...result.candidates].sort((a, b) => {
    if (confirmedId) {
      if (a.signature.id === confirmedId) return -1;
      if (b.signature.id === confirmedId) return 1;
    }
    return a.signature.prevalenceRank - b.signature.prevalenceRank;
  });

  const [topCandidate, ...restCandidates] = ordered;
  const isAmbiguous = ordered.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {confirmedId && (
        <Callout variant="success">
          Confirmed by matching the provided plaintext — no longer ambiguous.
        </Callout>
      )}

      {result.salt && (
        <Callout variant="info">
          Detected a <code>hash:salt</code> format — salt <code>{result.salt}</code> was separated
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
              <CandidateRow key={signature.id} signature={signature} confidence={confidence} isConfirmed={false} />
            ))}
          </div>
        </details>
      )}

      {isAmbiguous && !confirmedId && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {getContextHint(ordered.map((c) => c.signature.id))}
        </p>
      )}
    </div>
  );
}
