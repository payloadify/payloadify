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
    <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Additional Settings
        <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className="mt-3 flex flex-col gap-2">
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
