"use client";

import { WordlistSize } from "@/lib/subdomain/config";
import { Tooltip } from "@/components/ui/Tooltip";
import { toggleButtonClasses } from "@/components/ui/formClasses";

export function WordlistControls({
  wordlistSize,
  onWordlistSizeChange,
  useEnvTierWords,
  onToggleEnvTierWords,
  useServiceWords,
  onToggleServiceWords,
  useRegionWords,
  onToggleRegionWords,
}: {
  wordlistSize: WordlistSize;
  onWordlistSizeChange: (size: WordlistSize) => void;
  useEnvTierWords: boolean;
  onToggleEnvTierWords: (value: boolean) => void;
  useServiceWords: boolean;
  onToggleServiceWords: (value: boolean) => void;
  useRegionWords: boolean;
  onToggleRegionWords: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center text-sm font-medium">
        Built-in word sources
        <Tooltip
          text={
            "• Environment/tier: dev, staging, qa, prod, uat…\n" +
            "• Service: api, admin, vpn, mail, cdn, auth…\n" +
            "• Region/datacenter: us, eu, uk, aws, gcp…\n" +
            "• Compact = smaller list. Extended = adds more words to each category you've turned on."
          }
        />
      </label>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onToggleEnvTierWords(!useEnvTierWords)}
          title="Adds environment/tier words: dev, staging, qa, prod, uat, sandbox, etc."
          className={toggleButtonClasses(useEnvTierWords)}
        >
          Environment/tier
        </button>
        <button
          type="button"
          onClick={() => onToggleServiceWords(!useServiceWords)}
          title="Adds common service words: api, admin, vpn, mail, cdn, auth, etc."
          className={toggleButtonClasses(useServiceWords)}
        >
          Service
        </button>
        <button
          type="button"
          onClick={() => onToggleRegionWords(!useRegionWords)}
          title="Adds region/datacenter tokens: us, eu, uk, dc1, aws, gcp, etc."
          className={toggleButtonClasses(useRegionWords)}
        >
          Region/datacenter
        </button>
        <span className="mx-1 self-center text-zinc-300 dark:text-zinc-700">|</span>
        <button
          type="button"
          onClick={() => onWordlistSizeChange("compact")}
          title="Use the smaller curated word list for each enabled category above."
          className={toggleButtonClasses(wordlistSize === "compact")}
        >
          Compact
        </button>
        <button
          type="button"
          onClick={() => onWordlistSizeChange("extended")}
          title="Use the larger curated word list (superset of Compact) for each enabled category above: more coverage, more candidates."
          className={toggleButtonClasses(wordlistSize === "extended")}
        >
          Extended
        </button>
      </div>
    </div>
  );
}
