"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import { selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { ArchId, MSFVENOM_ARCHS_BY_ID } from "@/lib/msfvenom/archs";
import { FormatId, MsfvenomFormat } from "@/lib/msfvenom/formats";
import { MsfvenomPayload, PayloadId } from "@/lib/msfvenom/payloads";
import { Platform } from "@/lib/msfvenom/params";

const PLATFORM_FILTERS: Platform[] = ["windows", "linux", "macos", "android", "multi"];
const PLATFORM_LABELS: Record<Platform, string> = {
  windows: "Windows",
  linux: "Linux",
  macos: "macOS",
  android: "Android",
  multi: "Cross-platform",
};

export function PayloadSelectionFields({
  templateId,
  templates,
  onTemplateChange,
  platformFilter,
  onPlatformChange,
  payloadId,
  payload,
  visibleCategories,
  filteredPayloads,
  onPayloadChange,
  archId,
  onArchChange,
  formatId,
  format,
  formatOptions,
  onFormatChange,
}: {
  templateId: string | null;
  templates: { id: string; label: string }[];
  onTemplateChange: (id: string) => void;
  platformFilter: Platform;
  onPlatformChange: (platform: Platform) => void;
  payloadId: PayloadId;
  payload: MsfvenomPayload;
  visibleCategories: string[];
  filteredPayloads: MsfvenomPayload[];
  onPayloadChange: (id: PayloadId) => void;
  archId: ArchId | null;
  onArchChange: (id: ArchId) => void;
  formatId: FormatId;
  format: MsfvenomFormat;
  formatOptions: MsfvenomFormat[];
  onFormatChange: (id: FormatId) => void;
}) {
  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium">Template</label>
        <select value={templateId ?? ""} onChange={(e) => onTemplateChange(e.target.value)} className={`${selectClasses} w-full`}>
          <option value="">Custom</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Platform</label>
        <div className="flex flex-wrap gap-1">
          {PLATFORM_FILTERS.map((p) => (
            <button key={p} type="button" onClick={() => onPlatformChange(p)} className={toggleButtonClasses(platformFilter === p)}>
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Payload
          <Tooltip text={payload.whyUseIt} />
        </label>
        <select value={payloadId} onChange={(e) => onPayloadChange(e.target.value)} className={`${selectClasses} w-full`}>
          {visibleCategories.map((category) => (
            <optgroup key={category} label={category}>
              {filteredPayloads
                .filter((p) => p.category === category)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {payload.note && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{payload.note}</p>}
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{payload.whyUseIt}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Architecture
            <Tooltip text="Match this to your target's real architecture. 32-bit payloads run on 64-bit Windows via WoW64, but not the reverse." />
          </label>
          {payload.archs.length === 0 ? (
            <input value="N/A" disabled className={`${selectClasses} w-full opacity-50`} />
          ) : (
            <select
              value={archId ?? ""}
              onChange={(e) => onArchChange(e.target.value as ArchId)}
              disabled={payload.archs.length <= 1}
              className={`${selectClasses} w-full disabled:opacity-50`}
            >
              {payload.archs.map((id) => (
                <option key={id} value={id}>
                  {MSFVENOM_ARCHS_BY_ID[id].label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Output format
            <Tooltip text="Only formats compatible with the selected payload are shown." />
          </label>
          <select value={formatId} onChange={(e) => onFormatChange(e.target.value)} className={`${selectClasses} w-full`}>
            {formatOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          {format.note && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{format.note}</p>}
        </div>
      </div>
    </>
  );
}
