import { type ReactNode } from "react";
import { flagBadgeClasses, selectClasses } from "@/components/ui/formClasses";
import { NMAP_TEMPLATES, NMAP_TEMPLATES_BY_ID } from "@/lib/nmap/templates";

/** Matches a single whitespace-delimited word that is a CLI flag (e.g. "-T4", "--min-hostgroup"),
 *  optionally followed by trailing punctuation picked up from the surrounding sentence (e.g. the
 *  comma in "-Pn,"). Captures the flag and the trailing punctuation separately so only the flag
 *  itself gets the badge treatment, not the punctuation. */
const FLAG_WORD = /^(--?[A-Za-z][A-Za-z0-9-]*)([.,;:)]*)$/;

/** Strips trailing sentence punctuation off an arbitrary word (unlike FLAG_WORD, this doesn't
 *  require a leading dash, since flag arguments like "4096" or "RND:10" don't have one). */
const TRAILING_PUNCTUATION = /^(.*?)([.,;:)]*)$/;

/** How many words ahead of a flag to look for its argument. Covers both directly-adjacent mentions
 *  ("--min-hostgroup 4096") and ones with a small connective word in between ("--initial-rtt-timeout
 *  to 300ms"), without reaching so far that an unrelated later number gets mistaken for the arg. */
const VALUE_LOOKAHEAD_WORDS = 3;

/** Maps each flag in a template's fixedFlags to the literal argument token that follows it (e.g.
 *  "--min-hostgroup" -> "4096", "-D" -> "RND:10"), skipping pairs where the "next" token is itself
 *  another flag (i.e. the first token really does take an argument). Used so the notes renderer only
 *  ever highlights a value it can verify against the template's own ground-truth flags, never an
 *  arbitrary number that happens to appear in the prose. */
function buildFlagValueMap(fixedFlags: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (let i = 0; i < fixedFlags.length - 1; i++) {
    const flag = fixedFlags[i];
    const next = fixedFlags[i + 1];
    if (FLAG_WORD.test(flag) && !FLAG_WORD.test(next)) map.set(flag, next);
  }
  return map;
}

/** Renders a notes sentence with every CLI flag mentioned inline (e.g. "-T4", "--min-hostgroup")
 *  wrapped in a small code-styled badge, so the flags stand out from the surrounding prose instead
 *  of blending into it. Also badges a flag's argument (e.g. the "4096" in "--min-hostgroup 4096")
 *  when the template's own fixedFlags confirm that's really the value that flag takes, found within
 *  a small lookahead window so small connective words ("to", "of") in between don't break the match.
 *  Any other number in the prose is left untouched, since it can't be verified the same way. */
function renderNotesWithFlags(notes: string, fixedFlags: string[]): ReactNode[] {
  const flagValues = buildFlagValueMap(fixedFlags);
  const words = notes.split(/(\s+)/);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/^\s+$/.test(word)) {
      nodes.push(word);
      continue;
    }

    const flagMatch = word.match(FLAG_WORD);
    if (!flagMatch) {
      nodes.push(word);
      continue;
    }

    const [, flag, trailingPunctuation] = flagMatch;
    nodes.push(
      <code key={i} className={flagBadgeClasses}>
        {flag}
      </code>,
    );
    if (trailingPunctuation) nodes.push(trailingPunctuation);

    const expectedValue = flagValues.get(flag);
    if (!expectedValue) continue;

    let valueIndex = -1;
    let scanned = 0;
    for (let j = i + 1; j < words.length && scanned < VALUE_LOOKAHEAD_WORDS; j++) {
      if (/^\s+$/.test(words[j])) continue;
      const [, core] = words[j].match(TRAILING_PUNCTUATION) ?? [, words[j]];
      if (core === expectedValue) {
        valueIndex = j;
        break;
      }
      scanned++;
    }

    if (valueIndex === -1) continue;
    for (let k = i + 1; k < valueIndex; k++) nodes.push(words[k]);
    const [, valueCore, valuePunctuation] = words[valueIndex].match(TRAILING_PUNCTUATION) ?? [, words[valueIndex], ""];
    nodes.push(
      <code key={valueIndex} className={flagBadgeClasses}>
        {valueCore}
      </code>,
    );
    if (valuePunctuation) nodes.push(valuePunctuation);
    i = valueIndex;
  }

  return nodes;
}

/** No "Custom" fallback option here, unlike the MSFVenom template picker — every option is a
 *  real, fixed template. Switching to a hand-tuned build happens via the Custom Build mode
 *  toggle in the parent component, not by editing a field inside this one. */
export function TemplateFields({ templateId, onTemplateChange }: { templateId: string; onTemplateChange: (id: string) => void }) {
  const template = NMAP_TEMPLATES_BY_ID[templateId];
  const commonTemplates = NMAP_TEMPLATES.filter((t) => t.category === "common-scenarios");
  const advancedTemplates = NMAP_TEMPLATES.filter((t) => t.category === "payloadify-advanced");

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Scenario template</label>
        <select value={templateId} onChange={(e) => onTemplateChange(e.target.value)} className={`${selectClasses} w-full`}>
          <optgroup label="Common Scenarios">
            {commonTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}: {t.description}
              </option>
            ))}
          </optgroup>
          <optgroup label="Payloadify Advanced">
            {advancedTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}: {t.description}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {template && (
        <div className="rounded border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Fixed flags</p>
          <code className="mb-2 block text-sm">{template.fixedFlags.join(" ")}</code>
          <p className="text-zinc-600 dark:text-zinc-400">{renderNotesWithFlags(template.notes, template.fixedFlags)}</p>
        </div>
      )}
    </div>
  );
}
