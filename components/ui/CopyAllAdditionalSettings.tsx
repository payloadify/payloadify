"use client";

import type { CopyAllFieldOption } from "@/components/ui/CopyAllFieldList";

/** Collapsible "use URL form" toggle list for the Copy All panel. Like CopyAllFieldList, this
 *  only ever sees field labels/ids — never values. Caller is responsible for only rendering
 *  this when there's at least one URL-capable field (matches prior per-tool behavior). */
export function CopyAllAdditionalSettings({
  fields,
  urlFieldIds,
  collapsed,
  onToggleCollapsed,
  onToggleUrlForm,
  onToggleAll,
}: {
  fields: CopyAllFieldOption[];
  urlFieldIds: Set<string>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleUrlForm: (fieldId: string) => void;
  onToggleAll: (selectAll: boolean) => void;
}) {
  const allSelected = fields.length > 0 && fields.every((field) => urlFieldIds.has(field.id));

  return (
    <div className="rounded border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-900/40"
      >
        <span>
          Additional Settings
        </span>
        <span className={`transition-transform ${collapsed ? "" : "rotate-90"}`}>▸</span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2 border-t border-blue-200 px-3 pb-3 pt-3 dark:border-blue-900">
          <button
            type="button"
            onClick={() => onToggleAll(!allSelected)}
            className="self-start text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {allSelected ? "Unselect all" : "Select all"}
          </button>

          {fields.map((field) => (
            <label key={field.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={urlFieldIds.has(field.id)}
                onChange={() => onToggleUrlForm(field.id)}
                aria-label={`Use URL form for ${field.label} in Copy All`}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
              />
              Use URL for {field.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
