"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { CopyAllFieldList } from "@/components/ui/CopyAllFieldList";
import { CopyAllAdditionalSettings } from "@/components/ui/CopyAllAdditionalSettings";
import { CopyAllStylePicker } from "@/components/ui/CopyAllStylePicker";
import { WrappableCode } from "@/components/ui/WrappableCode";
import { CopyField, CopyStyle, formatList } from "@payloadify/cvss-core";
import { useCvssCopyAllSettings } from "@/lib/storage/cvssCopyAllSettings";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

const ADDITIONAL_SETTINGS_COLLAPSED_KEY = "payloadify:cvss-calculator:copy-all-additional-settings-collapsed";

export function CopyAllPanel({ fields }: { fields: CopyField[] }) {
  const [settings, updateSettings] = useCvssCopyAllSettings();
  const [additionalSettingsCollapsed, setAdditionalSettingsCollapsed] = usePersistedBoolean(ADDITIONAL_SETTINGS_COLLAPSED_KEY, true);
  const excludedIds = useMemo(() => new Set(settings.excludedIds), [settings.excludedIds]);
  const urlFieldIds = useMemo(() => new Set(settings.urlFieldIds), [settings.urlFieldIds]);
  const { styleKind, customPrefix, labelsEnabled } = settings;
  const urlCapableFields = useMemo(() => fields.filter((f) => f.url), [fields]);

  // Keep `order` in sync when the available fields change (e.g. switching templates changes
  // which fields exist) — preserve existing order for ids that still exist, append new ones.
  const effectiveOrder = useMemo(() => {
    const validIds = new Set(fields.map((f) => f.id));
    const kept = settings.order.filter((id) => validIds.has(id));
    const missing = fields.map((f) => f.id).filter((id) => !kept.includes(id));
    return [...kept, ...missing];
  }, [fields, settings.order]);

  const includedOrder = useMemo(() => effectiveOrder.filter((id) => !excludedIds.has(id)), [effectiveOrder, excludedIds]);
  const includedFields = useMemo(
    () =>
      fields
        .filter((f) => !excludedIds.has(f.id))
        .map((f) => (urlFieldIds.has(f.id) && f.url ? { ...f, value: f.url } : f)),
    [fields, excludedIds, urlFieldIds],
  );

  const style: CopyStyle = useMemo(
    () => (styleKind === "custom" ? { kind: "custom", prefix: customPrefix } : { kind: styleKind }),
    [styleKind, customPrefix],
  );
  const formatted = useMemo(
    () => formatList(includedFields, includedOrder, style, labelsEnabled),
    [includedFields, includedOrder, style, labelsEnabled],
  );

  function setPosition(fieldId: string, position: number) {
    // Reorder only among included fields — excluded ones are hidden from output and kept
    // out of the way at the end so their (currently meaningless) relative order doesn't shift.
    const withoutField = includedOrder.filter((id) => id !== fieldId);
    const reordered = [...withoutField.slice(0, position), fieldId, ...withoutField.slice(position)];
    const excluded = effectiveOrder.filter((id) => excludedIds.has(id));
    updateSettings({ order: [...reordered, ...excluded] });
  }

  function toggleIncluded(fieldId: string) {
    const next = new Set(excludedIds);
    if (next.has(fieldId)) next.delete(fieldId);
    else next.add(fieldId);
    updateSettings({ excludedIds: [...next] });
  }

  function toggleAllIncluded(selectAll: boolean) {
    updateSettings({ excludedIds: selectAll ? [] : effectiveOrder });
  }

  function toggleUrlForm(fieldId: string) {
    const next = new Set(urlFieldIds);
    if (next.has(fieldId)) next.delete(fieldId);
    else next.add(fieldId);
    updateSettings({ urlFieldIds: [...next] });
  }

  function toggleAllUrlForm(selectAll: boolean) {
    updateSettings({ urlFieldIds: selectAll ? urlCapableFields.map((f) => f.id) : [] });
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Combined Copy Format</div>

      <CopyAllFieldList
        fields={fields}
        effectiveOrder={effectiveOrder}
        excludedIds={excludedIds}
        includedOrder={includedOrder}
        onToggleIncluded={toggleIncluded}
        onSetPosition={setPosition}
        onToggleAll={toggleAllIncluded}
      />

      {urlCapableFields.length > 0 && (
        <CopyAllAdditionalSettings
          fields={urlCapableFields}
          urlFieldIds={urlFieldIds}
          collapsed={additionalSettingsCollapsed}
          onToggleCollapsed={() => setAdditionalSettingsCollapsed(!additionalSettingsCollapsed)}
          onToggleUrlForm={toggleUrlForm}
          onToggleAll={toggleAllUrlForm}
        />
      )}

      <CopyAllStylePicker
        styleKind={styleKind}
        customPrefix={customPrefix}
        onStyleChange={(kind) => updateSettings({ styleKind: kind })}
        onPrefixChange={(value) => updateSettings({ customPrefix: value })}
      />

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <WrappableCode
            text={includedFields.length > 0 ? formatted : "No fields selected. Check at least one field above."}
            extraControls={
              <button
                type="button"
                onClick={() => updateSettings({ labelsEnabled: !labelsEnabled })}
                aria-pressed={labelsEnabled}
                title="Prepend each field's label (e.g. 'Title:') in the Copy All output"
                className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
              >
                {labelsEnabled ? "Labels: On" : "Labels: Off"}
              </button>
            }
          />
        </div>
        <CopyButton text={formatted} label="Copy All" disabled={includedFields.length === 0} />
      </div>
    </div>
  );
}
