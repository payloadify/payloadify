import { selectClasses } from "@/components/ui/formClasses";
import { JWT_PRESETS } from "@/lib/jwt/presets";

export function PresetPicker({ value, onApply }: { value: string; onApply: (presetId: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Scenario presets</label>
      <select
        className={selectClasses}
        value={value}
        onChange={(e) => {
          if (e.target.value) onApply(e.target.value);
        }}
      >
        <option value="">Choose a preset…</option>
        {JWT_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id} title={preset.description}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}
