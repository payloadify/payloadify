"use client";

import { inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CopyStyle } from "@payloadify/cvss-core";

const STYLE_OPTIONS: { id: CopyStyle["kind"]; label: string }[] = [
  { id: "none", label: "No bullets" },
  { id: "bullets", label: "Bullet points" },
  { id: "numbers", label: "Numbered" },
  { id: "custom", label: "Custom" },
];

export function CopyAllStylePicker({
  styleKind,
  customPrefix,
  onStyleChange,
  onPrefixChange,
}: {
  styleKind: CopyStyle["kind"];
  customPrefix: string;
  onStyleChange: (kind: CopyStyle["kind"]) => void;
  onPrefixChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STYLE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={toggleButtonClasses(styleKind === opt.id)}
          onClick={() => onStyleChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
      {styleKind === "custom" && (
        <input
          className={`${inputClasses} w-32`}
          value={customPrefix}
          onChange={(e) => onPrefixChange(e.target.value)}
          placeholder="Prefix, e.g. -> "
        />
      )}
    </div>
  );
}
