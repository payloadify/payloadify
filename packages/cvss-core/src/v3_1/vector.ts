import {
  Cvss31Metrics,
  CVSS31_AC_OPTIONS,
  CVSS31_AV_OPTIONS,
  CVSS31_CIA_OPTIONS,
  CVSS31_PR_OPTIONS,
  CVSS31_S_OPTIONS,
  CVSS31_UI_OPTIONS,
} from "./metrics";

export function buildCvss31Vector(m: Cvss31Metrics): string {
  return `CVSS:3.1/AV:${m.AV}/AC:${m.AC}/PR:${m.PR}/UI:${m.UI}/S:${m.S}/C:${m.C}/I:${m.I}/A:${m.A}`;
}

function isValidToken<T extends string>(value: string | undefined, options: { id: T }[]): value is T {
  return value !== undefined && options.some((o) => o.id === value);
}

/** Parses a CVSS 3.1 vector string (with or without the leading "CVSS:3.1/") back into a
 *  Cvss31Metrics object, for the "Import from your own report" feature. Every token is validated
 *  against the same *_OPTIONS lists the form UI uses — an unrecognized or missing token returns
 *  `null` rather than guessing a default, since a silently-defaulted metric would compute a wrong
 *  score without any indication to the user (same reasoning as isValidOption in
 *  lib/storage/savedCvssTemplates.ts). Token order is not enforced on input, only that all 8
 *  required metrics are present with valid values. */
export function parseCvss31Vector(vector: string): Cvss31Metrics | null {
  const body = vector.trim().replace(/^CVSS:3\.1\//i, "");
  const tokens = new Map<string, string>();
  for (const part of body.split("/")) {
    const [key, value] = part.split(":");
    if (!key || value === undefined) return null;
    tokens.set(key.toUpperCase(), value);
  }

  const AV = tokens.get("AV");
  const AC = tokens.get("AC");
  const PR = tokens.get("PR");
  const UI = tokens.get("UI");
  const S = tokens.get("S");
  const C = tokens.get("C");
  const I = tokens.get("I");
  const A = tokens.get("A");

  if (
    !isValidToken(AV, CVSS31_AV_OPTIONS) ||
    !isValidToken(AC, CVSS31_AC_OPTIONS) ||
    !isValidToken(PR, CVSS31_PR_OPTIONS) ||
    !isValidToken(UI, CVSS31_UI_OPTIONS) ||
    !isValidToken(S, CVSS31_S_OPTIONS) ||
    !isValidToken(C, CVSS31_CIA_OPTIONS) ||
    !isValidToken(I, CVSS31_CIA_OPTIONS) ||
    !isValidToken(A, CVSS31_CIA_OPTIONS)
  ) {
    return null;
  }

  return { AV, AC, PR, UI, S, C, I, A };
}
