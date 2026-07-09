import { describeClaimTimestamp } from "./jwt";
import { COMMON_WEAK_SECRETS } from "./weakSecrets";
import { JoseAlg } from "./algorithms";

/** Weakness/education flags for the Generator's own state — a separate implementation from
 *  the Decoder's WarningsBanner.tsx (that shipped component is intentionally left untouched).
 *  Some logic shape overlap with WarningsBanner is expected. */

export type WeaknessFlag = { id: string; variant: "danger" | "warning"; text: string };

/** Rough floor: below this many characters, a plaintext secret is easy to brute-force
 *  regardless of charset (a conservative, explainable heuristic — not a real entropy
 *  calculation, since we don't know the charset the user typed a manual secret from). */
const SHORT_SECRET_CHAR_FLOOR = 16;

export function computeGeneratorWeaknessFlags(input: {
  alg: JoseAlg;
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  hmacSecret?: string | null;
}): WeaknessFlag[] {
  const flags: WeaknessFlag[] = [];
  const { alg, payload, hmacSecret } = input;

  if (alg === "none") {
    flags.push({
      id: "alg-none",
      variant: "danger",
      text: 'This token is unsigned ("alg": "none") — some libraries accept this and skip signature verification entirely. Use only to test whether a target rejects it, never as a real credential.',
    });
  }

  if (alg.toLowerCase().startsWith("hs") && hmacSecret) {
    if (hmacSecret.includes("-----BEGIN")) {
      flags.push({
        id: "secret-is-pem",
        variant: "danger",
        text: "The HMAC secret field contains a PEM key block. Pasting an RSA/EC public key here is the classic alg-confusion attack (RS256→HS256) — don't do this against a real target unless that's exactly the test you intend.",
      });
    } else if (COMMON_WEAK_SECRETS.includes(hmacSecret)) {
      flags.push({
        id: "secret-common-weak",
        variant: "danger",
        text: `"${hmacSecret}" is a common default/example HMAC secret — tokens signed with it can be forged by anyone who guesses it.`,
      });
    } else if (hmacSecret.length < SHORT_SECRET_CHAR_FLOOR) {
      flags.push({
        id: "secret-short",
        variant: "warning",
        text: `HMAC secret is only ${hmacSecret.length} characters — short secrets may be brute-forceable. Consider using the "Generate random secret" option instead.`,
      });
    }
  }

  if (payload && typeof payload === "object") {
    if (!("exp" in payload)) {
      flags.push({
        id: "missing-exp",
        variant: "warning",
        text: "No exp claim set — this token never expires.",
      });
    } else {
      const exp = describeClaimTimestamp(payload, "exp");
      if (exp?.status === "past") {
        flags.push({ id: "exp-past", variant: "warning", text: `exp is in the past (${exp.iso}) — this token is already expired.` });
      }
    }

    const nbf = describeClaimTimestamp(payload, "nbf");
    if (nbf?.status === "future") {
      flags.push({ id: "nbf-future", variant: "warning", text: `nbf is in the future (${nbf.iso}) — this token isn't valid yet.` });
    }
  }

  return flags;
}
