"use client";

import { ParsedDomain } from "@/lib/subdomain/domainParse";
import { checkboxLabelClasses, inputClasses } from "@/components/ui/formClasses";

export function DomainAndSeedInputs({
  rawBaseDomain,
  onBaseDomainChange,
  parsedDomain,
  includeSeedFromDomain,
  onToggleIncludeSeed,
  rawKeywords,
  onKeywordsChange,
  rawKnownSubdomains,
  onKnownSubdomainsChange,
}: {
  rawBaseDomain: string;
  onBaseDomainChange: (value: string) => void;
  parsedDomain: ParsedDomain;
  includeSeedFromDomain: boolean;
  onToggleIncludeSeed: (checked: boolean) => void;
  rawKeywords: string;
  onKeywordsChange: (value: string) => void;
  rawKnownSubdomains: string;
  onKnownSubdomainsChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Base domain</label>
        <input
          type="text"
          value={rawBaseDomain}
          onChange={(e) => onBaseDomainChange(e.target.value)}
          placeholder="example.com"
          className={inputClasses}
        />
        {rawBaseDomain.trim().length > 0 && !parsedDomain.valid && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{parsedDomain.error}</p>
        )}
        {parsedDomain.valid && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Base: <code>{parsedDomain.registrableDomain}</code>
            </span>
            {parsedDomain.seedLabel && (
              <>
                <span>
                  Detected seed word: <code>{parsedDomain.seedLabel}</code>
                </span>
                <label className={checkboxLabelClasses}>
                  <input
                    type="checkbox"
                    checked={includeSeedFromDomain}
                    onChange={(e) => onToggleIncludeSeed(e.target.checked)}
                  />
                  Include it
                </label>
              </>
            )}
          </div>
        )}
      </div>

      <details className="rounded border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Add your own keywords / seed subdomains (optional)</summary>
        <div className="flex flex-col gap-4 px-3 pb-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Keywords</label>
            <textarea
              value={rawKeywords}
              onChange={(e) => onKeywordsChange(e.target.value)}
              placeholder={"acme\ncustomerportal, billing"}
              rows={3}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Company/product names, environments, or observed tokens: one per line or comma-separated.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Seed from known subdomains</label>
            <textarea
              value={rawKnownSubdomains}
              onChange={(e) => onKnownSubdomainsChange(e.target.value)}
              placeholder={"api-dev.example.com\nvpn.example.com"}
              rows={3}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Paste subdomains you&apos;ve already discovered; their labels get extracted and mutated too.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
