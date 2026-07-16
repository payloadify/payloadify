"use client";

import { inputClasses, iconButtonClasses } from "@/components/ui/formClasses";

export function DomainAndSelectorInput({
  domain,
  onDomainChange,
  selector,
  onSelectorChange,
  onSubmit,
  loading,
  disabled,
  blockedMessage,
}: {
  domain: string;
  onDomainChange: (value: string) => void;
  selector: string;
  onSelectorChange: (value: string) => void;
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
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email-auth-domain" className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
          Domain to check
        </label>
        <div className="flex items-center gap-2">
          <input
            id="email-auth-domain"
            type="text"
            value={domain}
            onChange={(e) => onDomainChange(e.target.value)}
            placeholder="example.com"
            className={`${inputClasses} flex-1 font-sans`}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={disabled || loading} className={iconButtonClasses}>
            {loading ? "Checking…" : "Check"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email-auth-selector" className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
          DKIM selector (optional — leave blank to also try common selectors)
        </label>
        <input
          id="email-auth-selector"
          type="text"
          value={selector}
          onChange={(e) => onSelectorChange(e.target.value)}
          placeholder="e.g. google, selector1"
          className={`${inputClasses} font-sans`}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {blockedMessage && <p className="text-xs text-amber-600 dark:text-amber-400">{blockedMessage}</p>}
    </form>
  );
}
