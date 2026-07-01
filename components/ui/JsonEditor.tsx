export function JsonEditor({
  label,
  value,
  onChange,
  error,
  rows = 10,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className={`w-full rounded border bg-white p-3 font-mono text-sm text-zinc-900 outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-zinc-300 focus:ring-zinc-400 dark:border-zinc-700"
        }`}
      />
    </div>
  );
}
