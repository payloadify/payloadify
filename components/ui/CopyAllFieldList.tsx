"use client";

import { selectClasses } from "@/components/ui/formClasses";

/** Deliberately excludes `value` — this list only ever displays labels and lets the user
 *  reorder/include-exclude fields by id, so it structurally never sees field values (which may
 *  be sensitive, e.g. JWT secrets). See CopyAllPanel usages for the full field data. */
export interface CopyAllFieldOption {
  id: string;
  label: string;
}

export function CopyAllFieldList({
  fields,
  effectiveOrder,
  excludedIds,
  includedOrder,
  onToggleIncluded,
  onSetPosition,
}: {
  fields: CopyAllFieldOption[];
  effectiveOrder: string[];
  excludedIds: Set<string>;
  includedOrder: string[];
  onToggleIncluded: (fieldId: string) => void;
  onSetPosition: (fieldId: string, position: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {effectiveOrder.map((id) => {
        const field = fields.find((f) => f.id === id)!;
        const included = !excludedIds.has(id);
        const position = includedOrder.indexOf(id);
        return (
          <div key={id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={included}
              onChange={() => onToggleIncluded(id)}
              aria-label={`Include ${field.label} in Copy All`}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            <select
              className={selectClasses}
              value={included ? position : ""}
              disabled={!included}
              onChange={(e) => onSetPosition(id, Number(e.target.value))}
              aria-label={`Position for ${field.label}`}
            >
              {!included && <option value="">—</option>}
              {includedOrder.map((_, i) => (
                <option key={i} value={i}>
                  Position {i + 1}
                </option>
              ))}
            </select>
            <span className={`text-sm ${included ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}>{field.label}</span>
          </div>
        );
      })}
    </div>
  );
}
