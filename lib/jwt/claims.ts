import { parseJsonObject, describeClaimTimestamp } from "./jwt";
import { JoseAlg } from "./algorithms";

export function toNumericDate(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export type QuickClaimKey = "iss" | "sub" | "aud" | "exp" | "nbf" | "iat" | "jti";

/** Sets one claim on the payload JSON text, preserving all other existing claims/formatting
 *  intent (re-pretty-printed, matching the JsonEditor's 2-space convention). */
export function applyQuickClaim(payloadJson: string, key: QuickClaimKey, value: unknown): string {
  const payload = payloadJson.trim().length === 0 ? {} : parseJsonObject(payloadJson, "Payload");
  payload[key] = value;
  return JSON.stringify(payload, null, 2);
}

/** Sets alg (and typ:"JWT" only if typ is absent) on the header JSON text, preserving other
 *  existing header fields like kid. */
export function applyAlgToHeaderJson(headerJson: string, alg: JoseAlg): string {
  const header = headerJson.trim().length === 0 ? {} : parseJsonObject(headerJson, "Header");
  header.alg = alg;
  if (!("typ" in header)) header.typ = "JWT";
  return JSON.stringify(header, null, 2);
}

const UNITS: [string, number][] = [
  ["d", 86400],
  ["h", 3600],
  ["m", 60],
];

function formatDuration(totalSeconds: number): string {
  let remaining = totalSeconds;
  const parts: string[] = [];
  for (const [label, unitSeconds] of UNITS) {
    const count = Math.floor(remaining / unitSeconds);
    if (count > 0) {
      parts.push(`${count}${label}`);
      remaining -= count * unitSeconds;
    }
    if (parts.length === 2) break;
  }
  if (parts.length === 0) return "less than a minute";
  return parts.join(" ");
}

/** Human-readable "expires in 2h 15m" / "expired 3d ago" readout, built on top of the
 *  existing describeClaimTimestamp's past/future status. */
export function formatRelativeFromNow(epochSeconds: number, nowMs: number = Date.now()): string {
  const diffSeconds = epochSeconds - Math.floor(nowMs / 1000);
  if (diffSeconds >= 0) return `expires in ${formatDuration(diffSeconds)}`;
  return `expired ${formatDuration(-diffSeconds)} ago`;
}

export { describeClaimTimestamp };
