/** Neutral copy of the CopyField/CopyStyle/formatList shape used by the "Copy All" panel across
 *  tools. The original of this logic lives in packages/cvss-core/src/shared/copyFormat.ts and is
 *  imported from `@payloadify/cvss-core` even by unrelated tools (e.g. JWT Generator) purely
 *  because CVSS shipped first — a pre-existing smell this file deliberately does not compound a
 *  third time. This copy is used only by the Security Headers Analyzer and SPF/DKIM/DMARC
 *  Checker; the CVSS/JWT tools' existing imports are left untouched. */

export interface CopyField {
  id: string;
  label: string;
  value: string;
  /** Alternate URL-form value (e.g. an OWASP/MDN reference link) the user can opt into for Copy
   *  All, in place of the plain-text label. Only set for fields that have one. */
  url?: string;
}

export type CopyStyle = { kind: "none" } | { kind: "bullets" } | { kind: "numbers" } | { kind: "custom"; prefix: string };

/** Orders `fields` per `order` (ids not listed are appended in their original order), then
 *  prefixes each line per `style`, and joins with a single newline — no trailing blank lines,
 *  no field-name labels prepended. */
export function formatList(fields: CopyField[], order: string[], style: CopyStyle): string {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const ordered: CopyField[] = [];
  for (const id of order) {
    const field = byId.get(id);
    if (field) {
      ordered.push(field);
      byId.delete(id);
    }
  }
  ordered.push(...byId.values());

  return ordered
    .map((field, i) => {
      switch (style.kind) {
        case "none":
          return field.value;
        case "bullets":
          return `- ${field.value}`;
        case "numbers":
          return `${i + 1}. ${field.value}`;
        case "custom":
          return `${style.prefix}${field.value}`;
      }
    })
    .join("\n");
}
