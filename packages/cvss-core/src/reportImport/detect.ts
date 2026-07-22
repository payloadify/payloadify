import { CvssVersion } from "../shared/types";
import { Cvss31Metrics } from "../v3_1/metrics";
import { buildCvss31Vector, parseCvss31Vector } from "../v3_1/vector";
import { Cvss40Metrics } from "../v4_0/metrics";
import { buildCvss40Vector, parseCvss40Vector } from "../v4_0/vector";
import { CWE_ENTRIES_BY_ID, CweEntry } from "../references/cwe";
import { OWASP_CATEGORIES, OwaspCategory } from "../references/owasp";
import { CvssReference } from "../templates/types";

/**
 * "Import from your own report" detectors — one function per field, each pure and
 * synchronous over a pasted block of report text. No detector ever guesses: an ambiguous or
 * unrecognized match is treated as "not detected" (returns null / empty), never a best-effort
 * fallback, per the product requirement that a wrongly auto-filled field is worse than a blank
 * one for a security-literate audience.
 */

export interface DetectedCvssVector {
  version: CvssVersion;
  metrics: Cvss31Metrics | Cvss40Metrics;
  /** Re-derived via buildCvss31Vector/buildCvss40Vector from the parsed metrics, never the raw
   *  matched substring — guarantees the applied vector is canonically formatted even if the
   *  source text had extra whitespace/casing. */
  vector: string;
}

export interface CvssVectorDetectionResult {
  detected: DetectedCvssVector | null;
  /** True when more than one CVSS-vector-shaped substring was found in the text, regardless of
   *  whether they all parsed successfully — surfaced so the UI can warn "only the first was
   *  used" instead of silently picking one. */
  multipleFound: boolean;
}

const VECTOR_PATTERN = /CVSS:(3\.1|4\.0)\/[A-Za-z0-9:/]+/gi;

/** Finds and parses the first valid CVSS vector string in `text`. Tries every vector-shaped
 *  match in order (not just the first substring) since a garbled first match (e.g. truncated by
 *  a copy-paste artifact) shouldn't block a valid one appearing later in the same paste. */
export function detectCvssVector(text: string): CvssVectorDetectionResult {
  const matches = [...text.matchAll(VECTOR_PATTERN)];
  if (matches.length === 0) return { detected: null, multipleFound: false };

  for (const match of matches) {
    const version: CvssVersion = match[1] === "4.0" ? "4.0" : "3.1";
    if (version === "3.1") {
      const metrics = parseCvss31Vector(match[0]);
      if (metrics) return { detected: { version, metrics, vector: buildCvss31Vector(metrics) }, multipleFound: matches.length > 1 };
    } else {
      const metrics = parseCvss40Vector(match[0]);
      if (metrics) return { detected: { version, metrics, vector: buildCvss40Vector(metrics) }, multipleFound: matches.length > 1 };
    }
  }
  return { detected: null, multipleFound: matches.length > 1 };
}

const CWE_PATTERN = /CWE-\d+/i;

/** Only ever resolves to a real entry in our CWE_ENTRIES catalogue — a CWE-shaped string that
 *  isn't one of ours (typo, or a weakness we don't carry) is treated as not detected rather than
 *  fabricated. */
export function detectCwe(text: string): CweEntry | null {
  const match = text.match(CWE_PATTERN);
  if (!match) return null;
  const id = match[0].toUpperCase();
  return CWE_ENTRIES_BY_ID[id] ?? null;
}

const OWASP_CODE_PATTERN = /\b(?:API\d{1,2}|LLM\d{2}|M\d{1,2}|A\d{1,2}):20\d{2}\b/i;

/** OWASP category ids in this app are internal slugs (e.g. "web-a03-injection"), but every
 *  category's *label* is authored starting with the literal human-readable code (e.g.
 *  "A03:2021 - Injection", "API1:2023 - ...", "LLM01:2025 - ..."). Matching a code found in the
 *  report text against that label prefix lets us resolve back to our internal id without a
 *  separate code-to-id table that could drift out of sync with owasp.ts. */
export function detectOwaspCategory(text: string): OwaspCategory | null {
  const match = text.match(OWASP_CODE_PATTERN);
  if (!match) return null;
  const code = match[0].toUpperCase();
  return OWASP_CATEGORIES.find((c) => c.label.toUpperCase().startsWith(code)) ?? null;
}

const URL_PATTERN = /https?:\/\/[^\s"'<>()[\]]+/gi;
const MAX_DETECTED_REFERENCES = 20;

/** Deduped, capped list of URLs found in the text (order of first appearance). Trailing
 *  sentence-punctuation (".", ",", ")") commonly left attached to a URL in prose is stripped so
 *  "See https://example.com/finding." doesn't produce a broken trailing-dot URL. */
export function detectReferenceUrls(text: string): CvssReference[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0].replace(/[.,;:)\]]+$/, "");
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= MAX_DETECTED_REFERENCES) break;
  }
  return urls.map((url) => ({ label: "", url }));
}

export type LabeledReportField = "title" | "description" | "impact" | "notes";

/** Every recognized label line, across all labeled fields — used both to pick which field a
 *  labeled line starts (via FIELD_LABELS below) and to know where a field's captured text must
 *  stop (the start of any *other* recognized label), so one field's capture never bleeds into
 *  the next section. */
const FIELD_LABELS: Record<LabeledReportField, string[]> = {
  title: ["Title", "Finding"],
  description: ["Description"],
  impact: ["Impact"],
  notes: ["Notes", "Rationale"],
};

const ALL_LABELS = Object.values(FIELD_LABELS).flat();
const ANY_LABEL_LINE = new RegExp(`^\\s*(?:${ALL_LABELS.join("|")})\\s*:`, "i");
const MAX_LABELED_FIELD_LENGTH = 2000;

/** A line that *starts with* a raw CVSS vector, CWE id, or OWASP code (the common one-token-per-
 *  line report format) belongs to one of the other high-confidence detectors, not to whatever
 *  labeled prose field preceded it — without this check, a description/impact capture would
 *  otherwise swallow an unrelated vector/CWE/OWASP line sitting right after it with no blank line
 *  in between. Anchored to line-start (not "contains") so a description that merely *mentions* a
 *  CWE mid-sentence isn't cut short. */
function isStandaloneCodeLine(line: string): boolean {
  const trimmed = line.trim();
  return /^CVSS:(3\.1|4\.0)\//i.test(trimmed) || /^CWE-\d+/i.test(trimmed) || /^(?:API\d{1,2}|LLM\d{2}|M\d{1,2}|A\d{1,2}):20\d{2}/i.test(trimmed);
}

/** Finds a line starting with one of `field`'s recognized labels (e.g. "Description:") and
 *  captures the rest of that line plus any following lines, stopping at the next blank line, the
 *  next recognized label line (from *any* field), or a standalone vector/CWE/OWASP line, whichever
 *  comes first. Deliberately does not attempt free-form extraction when no labeled line exists —
 *  unlabeled prose has no reliable structural signal, so it's left undetected rather than guessed
 *  at. */
export function detectLabeledField(text: string, field: LabeledReportField): string | null {
  const labels = FIELD_LABELS[field];
  const startPattern = new RegExp(`^\\s*(?:${labels.join("|")})\\s*:\\s*(.*)$`, "i");
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(startPattern);
    if (!match) continue;

    const collected = [match[1]];
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j];
      if (next.trim() === "" || ANY_LABEL_LINE.test(next) || isStandaloneCodeLine(next)) break;
      collected.push(next);
    }
    const value = collected.join("\n").trim().slice(0, MAX_LABELED_FIELD_LENGTH);
    return value.length > 0 ? value : null;
  }
  return null;
}

export interface CvssReportImportDetection {
  vector: CvssVectorDetectionResult;
  cwe: CweEntry | null;
  owasp: OwaspCategory | null;
  references: CvssReference[];
  title: string | null;
  description: string | null;
  impact: string | null;
  notes: string | null;
}

/** Runs every detector once over a single pasted report excerpt — the one entry point the
 *  import modal calls on submit. Each key mirrors a field in the preview/confirm UI. */
export function detectCvssFieldsFromReport(text: string): CvssReportImportDetection {
  return {
    vector: detectCvssVector(text),
    cwe: detectCwe(text),
    owasp: detectOwaspCategory(text),
    references: detectReferenceUrls(text),
    title: detectLabeledField(text, "title"),
    description: detectLabeledField(text, "description"),
    impact: detectLabeledField(text, "impact"),
    notes: detectLabeledField(text, "notes"),
  };
}
