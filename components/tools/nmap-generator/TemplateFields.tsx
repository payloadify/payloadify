import { selectClasses } from "@/components/ui/formClasses";
import { NMAP_TEMPLATES, NMAP_TEMPLATES_BY_ID } from "@/lib/nmap/templates";

/** No "Custom" fallback option here, unlike the MSFVenom template picker — every option is a
 *  real, fixed template. Switching to a hand-tuned build happens via the Custom Build mode
 *  toggle in the parent component, not by editing a field inside this one. */
export function TemplateFields({ templateId, onTemplateChange }: { templateId: string; onTemplateChange: (id: string) => void }) {
  const template = NMAP_TEMPLATES_BY_ID[templateId];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Scenario template</label>
        <select value={templateId} onChange={(e) => onTemplateChange(e.target.value)} className={`${selectClasses} w-full`}>
          {NMAP_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} — {t.description}
            </option>
          ))}
        </select>
      </div>

      {template && (
        <div className="rounded border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Fixed flags</p>
          <code className="mb-2 block text-sm">{template.fixedFlags.join(" ")}</code>
          <p className="text-zinc-600 dark:text-zinc-400">{template.notes}</p>
        </div>
      )}
    </div>
  );
}
