import { Callout } from "@/components/ui/Callout";
import { DecodedJwt, describeClaimTimestamp } from "@/lib/jwt/jwt";

export function WarningsBanner({
  decoded,
  weakSecret,
}: {
  decoded: DecodedJwt;
  weakSecret: string | null;
}) {
  const warnings: { variant: "danger" | "warning"; text: string }[] = [];

  if (decoded.isAlgNone) {
    warnings.push({
      variant: "danger",
      text: 'Header sets "alg": "none". Some libraries accept this and skip signature verification entirely.',
    });
  }

  if (decoded.alg && !decoded.alg.toLowerCase().startsWith("hs") && !decoded.isAlgNone) {
    warnings.push({
      variant: "warning",
      text: `Algorithm "${decoded.alg}" uses asymmetric or unknown signing. This tool can't verify or re-sign it without a private/public key. Watch for alg-confusion attacks (e.g. swapping RS256 for HS256 using the public key as an HMAC secret).`,
    });
  }

  if (weakSecret) {
    warnings.push({
      variant: "danger",
      text: `Signature verifies against a common default secret: "${weakSecret}". This token can be forged.`,
    });
  }

  const claims = decoded.payload.json as Record<string, unknown> | null;
  if (claims && typeof claims === "object") {
    const exp = describeClaimTimestamp(claims, "exp");
    if (exp?.status === "past") {
      warnings.push({ variant: "warning", text: `Token expired at ${exp.iso} (exp claim).` });
    }
    const nbf = describeClaimTimestamp(claims, "nbf");
    if (nbf?.status === "future") {
      warnings.push({ variant: "warning", text: `Token not valid until ${nbf.iso} (nbf claim).` });
    }
  }

  if (warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w, i) => (
        <Callout key={i} variant={w.variant}>
          {w.text}
        </Callout>
      ))}
    </div>
  );
}
