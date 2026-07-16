"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { WrappableCode } from "@/components/ui/WrappableCode";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

const RAW_HEADERS_COLLAPSED_KEY = "payloadify:security-headers-analyzer:raw-headers-collapsed";

export function RawHeadersPanel({ rawHeaders }: { rawHeaders: Record<string, string> }) {
  const [collapsed, setCollapsed] = usePersistedBoolean(RAW_HEADERS_COLLAPSED_KEY, true);
  const entries = Object.entries(rawHeaders).sort(([a], [b]) => a.localeCompare(b));
  const formatted = entries.map(([key, value]) => `${key}: ${value}`).join("\n");

  return (
    <div className="rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Raw Response Headers
        <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className="mt-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <WrappableCode text={formatted} />
          </div>
          <CopyButton text={formatted} label="Copy" />
        </div>
      )}
    </div>
  );
}
