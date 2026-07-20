"use client";

import { Callout } from "@/components/ui/Callout";
import { inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CandidateEstimate } from "@/lib/subdomain/estimate";
import { isValidMaxOutput, MAX_OUTPUT_CEILING, MAX_OUTPUT_FLOOR } from "@/lib/subdomain/validation";

export function GenerationGuardrail({
  estimate,
  maxOutputInputValue,
  effectiveMaxOutput,
  onMaxOutputChange,
  onGenerate,
  generateDisabled,
  blockedMessage,
}: {
  estimate: CandidateEstimate;
  /** Raw value bound to the input — can be out of [floor, ceiling], the field never snaps it
   *  back on its own. */
  maxOutputInputValue: number;
  /** Clamped value that actually drives generation regardless of what's typed — this is the
   *  real safety net, so generation itself can never exceed it even if the field shows a bogus
   *  or out-of-range number. Used for the warning text and the Max button's active state. */
  effectiveMaxOutput: number;
  onMaxOutputChange: (value: number) => void;
  onGenerate: () => void;
  generateDisabled: boolean;
  blockedMessage: string | null;
}) {
  const outOfRange = !isValidMaxOutput(maxOutputInputValue);

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm">
            Up to <span className="font-semibold">~{estimate.approxTotal.toLocaleString()}</span> candidates with current settings.
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-zinc-500 dark:text-zinc-400">Breakdown by mode</summary>
            <ul className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <li>Standalone: ~{estimate.breakdown.standalone.toLocaleString()}</li>
              <li>Affixing: ~{estimate.breakdown.affixing.toLocaleString()}</li>
              <li>Numbering: ~{estimate.breakdown.numbering.toLocaleString()}</li>
              <li>Word-joining: ~{estimate.breakdown.wordJoining.toLocaleString()}</li>
            </ul>
          </details>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <label className="text-sm">Max output</label>
            <input
              type="number"
              value={maxOutputInputValue}
              onChange={(e) => onMaxOutputChange(Number(e.target.value))}
              className={`${inputClasses} w-28`}
            />
            <button
              type="button"
              onClick={() => onMaxOutputChange(MAX_OUTPUT_CEILING)}
              title={`Set to the recommended ceiling (${MAX_OUTPUT_CEILING.toLocaleString()}).`}
              className={toggleButtonClasses(effectiveMaxOutput === MAX_OUTPUT_CEILING)}
            >
              Max
            </button>
          </div>
          {outOfRange && (
            <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
              Enter a whole number between {MAX_OUTPUT_FLOOR.toLocaleString()} and {MAX_OUTPUT_CEILING.toLocaleString()}. Rendering more
              than that in-browser risks freezing the tab (500k+ can take several seconds, 1M+ can hang it). Generation will use{" "}
              {effectiveMaxOutput.toLocaleString()}
              {" "}instead of what&apos;s typed here.
            </p>
          )}
        </div>
      </div>

      {estimate.exceedsCap && (
        <Callout variant="warning">
          Current settings could produce more than {effectiveMaxOutput.toLocaleString()} candidates. Generation will stop at the cap
          and the list may be incomplete. Narrow the modes above or raise the cap deliberately.
        </Callout>
      )}

      {blockedMessage && <Callout variant="danger">{blockedMessage}</Callout>}

      <button
        type="button"
        onClick={onGenerate}
        disabled={generateDisabled}
        className="self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Generate
      </button>
    </div>
  );
}
