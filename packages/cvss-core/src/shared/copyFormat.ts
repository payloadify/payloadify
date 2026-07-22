export interface CopyField {
  id: string;
  label: string;
  value: string;
  /** Alternate URL-form value (e.g. the OWASP/CWE reference page) the user can opt into for
   *  Copy All, in place of the plain-text label. Only set for fields that have one. */
  url?: string;
}

export type CopyStyle = { kind: "none" } | { kind: "bullets" } | { kind: "numbers" } | { kind: "custom"; prefix: string };

/** Orders `fields` per `order` (ids not listed are appended in their original order), optionally
 *  prepends each field's own `label:` (opt-in via `showLabels`, defaults off to match prior
 *  "just separated with linebreak" behavior), then prefixes each line per `style`, and joins with
 *  a single newline — no trailing blank lines. */
export function formatList(fields: CopyField[], order: string[], style: CopyStyle, showLabels = false): string {
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
      const text = showLabels ? `${field.label}: ${field.value}` : field.value;
      switch (style.kind) {
        case "none":
          return text;
        case "bullets":
          return `- ${text}`;
        case "numbers":
          return `${i + 1}. ${text}`;
        case "custom":
          return `${style.prefix}${text}`;
      }
    })
    .join("\n");
}
