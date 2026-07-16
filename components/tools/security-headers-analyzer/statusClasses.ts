import { HeaderStatus } from "@/lib/security-headers/types";

/** A new 3-state (pass/warn/missing) color record — deliberately not a reuse of the CVSS
 *  calculator's 5-value SeverityRating palette (components/tools/cvss-calculator/OutputPanel.tsx),
 *  which is a different, CVSS-specific scale. Kept literal (no 4th color) — a missing
 *  informational header (COOP/COEP/CORP) still renders red like any other "missing", but its
 *  label gets an "Optional" suffix via headerStatusLabel() below rather than a distinct color. */
export const HEADER_STATUS_CLASSES: Record<HeaderStatus, string> = {
  pass: "text-green-600 dark:text-green-400",
  warn: "text-amber-600 dark:text-amber-400",
  missing: "text-red-600 dark:text-red-400",
};

export const HEADER_STATUS_LABELS: Record<HeaderStatus, string> = {
  pass: "Pass",
  warn: "Warn",
  missing: "Missing",
};

/** "Missing" alone reads the same for a missing HSTS header and a missing COOP header, but the
 *  latter is extra hardening the spec calls informational, not a hard requirement — append
 *  "Optional" so the two don't look equally severe. Shared by the finding card and the Copy All
 *  panel so the on-screen label and the copied text always agree. */
export function headerStatusLabel(finding: { status: HeaderStatus; informational: boolean }): string {
  const base = HEADER_STATUS_LABELS[finding.status];
  return finding.status === "missing" && finding.informational ? `${base} · Optional` : base;
}
