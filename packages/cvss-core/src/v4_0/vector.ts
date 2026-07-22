import {
  Cvss40Metrics,
  CVSS40_AC_OPTIONS,
  CVSS40_AT_OPTIONS,
  CVSS40_AV_OPTIONS,
  CVSS40_E_OPTIONS,
  CVSS40_IMPACT_OPTIONS,
  CVSS40_PR_OPTIONS,
  CVSS40_UI_OPTIONS,
} from "./metrics";

/** Base metrics are always included; the Threat metric (E) is only appended when it's not
 *  "Not Defined" (X) — matching the CVSS v4.0 spec's convention of omitting Not Defined
 *  metrics from the vector string representation. */
export function buildCvss40Vector(m: Cvss40Metrics): string {
  const base = `CVSS:4.0/AV:${m.AV}/AC:${m.AC}/AT:${m.AT}/PR:${m.PR}/UI:${m.UI}/VC:${m.VC}/VI:${m.VI}/VA:${m.VA}/SC:${m.SC}/SI:${m.SI}/SA:${m.SA}`;
  return m.E === "X" ? base : `${base}/E:${m.E}`;
}

function isValidToken<T extends string>(value: string | undefined, options: { id: T }[]): value is T {
  return value !== undefined && options.some((o) => o.id === value);
}

/** Parses a CVSS 4.0 vector string (with or without the leading "CVSS:4.0/") back into a
 *  Cvss40Metrics object, for the "Import from your own report" feature. Same validate-or-reject
 *  approach as parseCvss31Vector: every base metric must be present with a value from the same
 *  *_OPTIONS list the form UI uses, or the whole parse returns `null`. E (Exploit Maturity) is the
 *  one metric the spec allows to be omitted from the string entirely — defaults to "X" (Not
 *  Defined), matching buildCvss40Vector's own omit-when-X behavior, not a guess about the finding. */
export function parseCvss40Vector(vector: string): Cvss40Metrics | null {
  const body = vector.trim().replace(/^CVSS:4\.0\//i, "");
  const tokens = new Map<string, string>();
  for (const part of body.split("/")) {
    const [key, value] = part.split(":");
    if (!key || value === undefined) return null;
    tokens.set(key.toUpperCase(), value);
  }

  const AV = tokens.get("AV");
  const AC = tokens.get("AC");
  const AT = tokens.get("AT");
  const PR = tokens.get("PR");
  const UI = tokens.get("UI");
  const VC = tokens.get("VC");
  const VI = tokens.get("VI");
  const VA = tokens.get("VA");
  const SC = tokens.get("SC");
  const SI = tokens.get("SI");
  const SA = tokens.get("SA");
  const E = tokens.get("E") ?? "X";

  if (
    !isValidToken(AV, CVSS40_AV_OPTIONS) ||
    !isValidToken(AC, CVSS40_AC_OPTIONS) ||
    !isValidToken(AT, CVSS40_AT_OPTIONS) ||
    !isValidToken(PR, CVSS40_PR_OPTIONS) ||
    !isValidToken(UI, CVSS40_UI_OPTIONS) ||
    !isValidToken(VC, CVSS40_IMPACT_OPTIONS) ||
    !isValidToken(VI, CVSS40_IMPACT_OPTIONS) ||
    !isValidToken(VA, CVSS40_IMPACT_OPTIONS) ||
    !isValidToken(SC, CVSS40_IMPACT_OPTIONS) ||
    !isValidToken(SI, CVSS40_IMPACT_OPTIONS) ||
    !isValidToken(SA, CVSS40_IMPACT_OPTIONS) ||
    !isValidToken(E, CVSS40_E_OPTIONS)
  ) {
    return null;
  }

  return { AV, AC, AT, PR, UI, VC, VI, VA, SC, SI, SA, E };
}
