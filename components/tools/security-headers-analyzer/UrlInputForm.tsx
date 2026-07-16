"use client";

import { inputClasses, iconButtonClasses } from "@/components/ui/formClasses";

export function UrlInputForm({
  url,
  onUrlChange,
  onSubmit,
  loading,
  disabled,
  blockedMessage,
}: {
  url: string;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
  blockedMessage: string | null;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="security-headers-url" className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
        URL to analyze
      </label>
      <div className="flex items-center gap-2">
        <input
          id="security-headers-url"
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="example.com or https://example.com"
          className={`${inputClasses} flex-1 font-sans`}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" disabled={disabled || loading} className={iconButtonClasses}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
      {blockedMessage && <p className="text-xs text-amber-600 dark:text-amber-400">{blockedMessage}</p>}
    </form>
  );
}
