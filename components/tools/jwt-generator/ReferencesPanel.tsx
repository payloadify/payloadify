"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { JWT_REFERENCES } from "@/lib/jwt/references";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

const COLLAPSED_KEY = "payloadify:jwt-generator:references-collapsed";

export function ReferencesPanel() {
  const [collapsed, setCollapsed] = usePersistedBoolean(COLLAPSED_KEY, true);

  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        References
        <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <ul className="flex flex-col gap-1.5">
          {JWT_REFERENCES.map((ref) => (
            <li key={ref.id} className="flex items-center justify-between gap-2 text-sm">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                {ref.label} <span className="text-xs text-zinc-500 dark:text-zinc-400">({ref.source})</span>
              </a>
              <CopyButton text={ref.url} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
