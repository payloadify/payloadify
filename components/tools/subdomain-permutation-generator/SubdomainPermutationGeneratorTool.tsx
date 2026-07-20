"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { ReferencesPanel } from "@/components/ui/ReferencesPanel";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { DEFAULT_CONFIG_FLAGS, SeparatorId, SortMode, SubdomainGeneratorConfig, WordlistSize } from "@/lib/subdomain/config";
import { extractSeedWordsFromKnownSubdomains, parseBaseDomainInput } from "@/lib/subdomain/domainParse";
import { estimateCandidateCount } from "@/lib/subdomain/estimate";
import { GenerationResult, generateSubdomainCandidates } from "@/lib/subdomain/generate";
import { SUBDOMAIN_RESOLVER_REFERENCES } from "@/lib/subdomain/references";
import { clampMaxOutput, clampNumberingRange } from "@/lib/subdomain/validation";
import { dedupeWords, parseFreeTextWordList } from "@/lib/subdomain/words";
import { DomainAndSeedInputs } from "./DomainAndSeedInputs";
import { GenerationGuardrail } from "./GenerationGuardrail";
import { OutputPanel } from "./OutputPanel";
import { PermutationModeControls } from "./PermutationModeControls";
import { SeparatorControls } from "./SeparatorControls";
import { WordlistControls } from "./WordlistControls";

const DEFAULTS = {
  rawBaseDomain: "",
  rawKeywords: "",
  rawKnownSubdomains: "",
  includeSeedFromDomain: true,
  filterPattern: "",
  filterMode: "include" as "include" | "exclude",
  ...DEFAULT_CONFIG_FLAGS,
};

const NUMBERING_MIN_DEFAULT_TEXT = String(DEFAULT_CONFIG_FLAGS.numberingMin);
const NUMBERING_MAX_DEFAULT_TEXT = String(DEFAULT_CONFIG_FLAGS.numberingMax);

const HISTORY_KEY = "payloadify:subdomain-permutation-generator:history";
const REFERENCES_COLLAPSED_KEY = "payloadify:subdomain-permutation-generator:references-collapsed";

export function SubdomainPermutationGeneratorTool() {
  const [rawBaseDomain, setRawBaseDomain] = useState(DEFAULTS.rawBaseDomain);
  const [rawKeywords, setRawKeywords] = useState(DEFAULTS.rawKeywords);
  const [rawKnownSubdomains, setRawKnownSubdomains] = useState(DEFAULTS.rawKnownSubdomains);
  const [includeSeedFromDomain, setIncludeSeedFromDomain] = useState(DEFAULTS.includeSeedFromDomain);

  const [wordlistSize, setWordlistSize] = useState<WordlistSize>(DEFAULTS.wordlistSize);
  const [useEnvTierWords, setUseEnvTierWords] = useState(DEFAULTS.useEnvTierWords);
  const [useServiceWords, setUseServiceWords] = useState(DEFAULTS.useServiceWords);
  const [useRegionWords, setUseRegionWords] = useState(DEFAULTS.useRegionWords);

  const [includeStandalone, setIncludeStandalone] = useState(DEFAULTS.includeStandalone);
  const [includeAffixing, setIncludeAffixing] = useState(DEFAULTS.includeAffixing);
  const [includeNumbering, setIncludeNumbering] = useState(DEFAULTS.includeNumbering);
  const [numberingMinText, setNumberingMinText] = useState(NUMBERING_MIN_DEFAULT_TEXT);
  const [numberingMaxText, setNumberingMaxText] = useState(NUMBERING_MAX_DEFAULT_TEXT);
  const [numberingZeroPadded, setNumberingZeroPadded] = useState(DEFAULTS.numberingZeroPadded);
  const [includeWordJoining, setIncludeWordJoining] = useState(DEFAULTS.includeWordJoining);

  const [separators, setSeparators] = useState<SeparatorId[]>(DEFAULTS.separators);
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULTS.sortMode);
  const [maxOutputText, setMaxOutputText] = useState(String(DEFAULTS.maxOutput));

  // Pending = what's in the input controls; applied = what actually drives filtering. Kept
  // separate so the regex scan only runs when the user clicks Apply, not on every keystroke.
  const [pendingFilterPattern, setPendingFilterPattern] = useState(DEFAULTS.filterPattern);
  const [pendingFilterMode, setPendingFilterMode] = useState<"include" | "exclude">(DEFAULTS.filterMode);
  const [appliedFilterPattern, setAppliedFilterPattern] = useState(DEFAULTS.filterPattern);
  const [appliedFilterMode, setAppliedFilterMode] = useState<"include" | "exclude">(DEFAULTS.filterMode);

  const [generatedResult, setGeneratedResult] = useState<GenerationResult | null>(null);
  const {
    blockedMsg: blockedMessage,
    setBlockedMsg: setBlockedMessage,
    checkAndClear,
    recordGeneration,
  } = useRateLimitedGeneration(HISTORY_KEY);

  // Only the free-text inputs are debounced — toggles/buttons are discrete and should feel
  // instant, so the live count recomputes immediately for those.
  const debouncedKeywordsRaw = useDebouncedValue(rawKeywords, 200);
  const debouncedKnownSubdomainsRaw = useDebouncedValue(rawKnownSubdomains, 200);

  const parsedDomain = useMemo(() => parseBaseDomainInput(rawBaseDomain), [rawBaseDomain]);

  const keywords = useMemo(() => parseFreeTextWordList(debouncedKeywordsRaw), [debouncedKeywordsRaw]);

  const seedLabels = useMemo(() => {
    const fromKnown = extractSeedWordsFromKnownSubdomains(debouncedKnownSubdomainsRaw, parsedDomain.registrableDomain);
    const fromDomain = includeSeedFromDomain && parsedDomain.seedLabel ? [parsedDomain.seedLabel] : [];
    return dedupeWords([...fromDomain, ...fromKnown]);
  }, [debouncedKnownSubdomainsRaw, parsedDomain.registrableDomain, parsedDomain.seedLabel, includeSeedFromDomain]);

  const maxOutput = clampMaxOutput(Number(maxOutputText));
  const numberingRange = clampNumberingRange(Number(numberingMinText), Number(numberingMaxText));

  const config: SubdomainGeneratorConfig = useMemo(
    () => ({
      baseDomain: parsedDomain.registrableDomain,
      keywords,
      seedLabels,
      wordlistSize,
      useEnvTierWords,
      useServiceWords,
      useRegionWords,
      includeStandalone,
      includeAffixing,
      includeNumbering,
      numberingMin: numberingRange.min,
      numberingMax: numberingRange.max,
      numberingZeroPadded,
      includeWordJoining,
      separators,
      sortMode,
      maxOutput,
    }),
    [
      parsedDomain.registrableDomain,
      keywords,
      seedLabels,
      wordlistSize,
      useEnvTierWords,
      useServiceWords,
      useRegionWords,
      includeStandalone,
      includeAffixing,
      includeNumbering,
      numberingRange.min,
      numberingRange.max,
      numberingZeroPadded,
      includeWordJoining,
      separators,
      sortMode,
      maxOutput,
    ],
  );

  const estimate = useMemo(() => estimateCandidateCount(config), [config]);

  function toggleSeparator(sep: SeparatorId) {
    setSeparators((prev) => {
      if (prev.includes(sep)) {
        return prev.length === 1 ? prev : prev.filter((s) => s !== sep);
      }
      return [...prev, sep];
    });
  }

  function handleGenerate() {
    const check = checkAndClear();
    if (!check.allowed) return;
    setGeneratedResult(generateSubdomainCandidates(config));
    recordGeneration(check.now);
  }

  function handleApplyFilter() {
    setAppliedFilterPattern(pendingFilterPattern);
    setAppliedFilterMode(pendingFilterMode);
  }

  function handleReset() {
    setRawBaseDomain(DEFAULTS.rawBaseDomain);
    setRawKeywords(DEFAULTS.rawKeywords);
    setRawKnownSubdomains(DEFAULTS.rawKnownSubdomains);
    setIncludeSeedFromDomain(DEFAULTS.includeSeedFromDomain);
    setWordlistSize(DEFAULTS.wordlistSize);
    setUseEnvTierWords(DEFAULTS.useEnvTierWords);
    setUseServiceWords(DEFAULTS.useServiceWords);
    setUseRegionWords(DEFAULTS.useRegionWords);
    setIncludeStandalone(DEFAULTS.includeStandalone);
    setIncludeAffixing(DEFAULTS.includeAffixing);
    setIncludeNumbering(DEFAULTS.includeNumbering);
    setNumberingMinText(NUMBERING_MIN_DEFAULT_TEXT);
    setNumberingMaxText(NUMBERING_MAX_DEFAULT_TEXT);
    setNumberingZeroPadded(DEFAULTS.numberingZeroPadded);
    setIncludeWordJoining(DEFAULTS.includeWordJoining);
    setSeparators(DEFAULTS.separators);
    setSortMode(DEFAULTS.sortMode);
    setMaxOutputText(String(DEFAULTS.maxOutput));
    setPendingFilterPattern(DEFAULTS.filterPattern);
    setPendingFilterMode(DEFAULTS.filterMode);
    setAppliedFilterPattern(DEFAULTS.filterPattern);
    setAppliedFilterMode(DEFAULTS.filterMode);
    setGeneratedResult(null);
    setBlockedMessage(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice subject="domains" />
      <Callout variant="info">
        100% client-side, generation only. This tool builds a candidate wordlist; it never queries DNS or contacts the target.
      </Callout>

      <DomainAndSeedInputs
        rawBaseDomain={rawBaseDomain}
        onBaseDomainChange={setRawBaseDomain}
        parsedDomain={parsedDomain}
        includeSeedFromDomain={includeSeedFromDomain}
        onToggleIncludeSeed={setIncludeSeedFromDomain}
        rawKeywords={rawKeywords}
        onKeywordsChange={setRawKeywords}
        rawKnownSubdomains={rawKnownSubdomains}
        onKnownSubdomainsChange={setRawKnownSubdomains}
      />

      <WordlistControls
        wordlistSize={wordlistSize}
        onWordlistSizeChange={setWordlistSize}
        useEnvTierWords={useEnvTierWords}
        onToggleEnvTierWords={setUseEnvTierWords}
        useServiceWords={useServiceWords}
        onToggleServiceWords={setUseServiceWords}
        useRegionWords={useRegionWords}
        onToggleRegionWords={setUseRegionWords}
      />

      <PermutationModeControls
        includeStandalone={includeStandalone}
        onToggleStandalone={setIncludeStandalone}
        includeAffixing={includeAffixing}
        onToggleAffixing={setIncludeAffixing}
        includeNumbering={includeNumbering}
        onToggleNumbering={setIncludeNumbering}
        numberingMinText={numberingMinText}
        onNumberingMinTextChange={setNumberingMinText}
        numberingMaxText={numberingMaxText}
        onNumberingMaxTextChange={setNumberingMaxText}
        numberingZeroPadded={numberingZeroPadded}
        onToggleNumberingZeroPadded={setNumberingZeroPadded}
        includeWordJoining={includeWordJoining}
        onToggleWordJoining={setIncludeWordJoining}
      />

      <SeparatorControls separators={separators} onToggle={toggleSeparator} />

      <GenerationGuardrail
        estimate={estimate}
        maxOutputInputValue={Number(maxOutputText)}
        effectiveMaxOutput={maxOutput}
        onMaxOutputChange={(value) => setMaxOutputText(String(value))}
        onGenerate={handleGenerate}
        generateDisabled={!parsedDomain.valid}
        blockedMessage={blockedMessage}
      />

      <button
        type="button"
        onClick={handleReset}
        className="self-start rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Reset
      </button>

      <OutputPanel
        generatedResult={generatedResult}
        baseDomain={parsedDomain.registrableDomain}
        pendingFilterPattern={pendingFilterPattern}
        pendingFilterMode={pendingFilterMode}
        onPendingFilterPatternChange={setPendingFilterPattern}
        onPendingFilterModeChange={setPendingFilterMode}
        appliedFilterPattern={appliedFilterPattern}
        appliedFilterMode={appliedFilterMode}
        onApplyFilter={handleApplyFilter}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
      />

      <ReferencesPanel references={SUBDOMAIN_RESOLVER_REFERENCES} storageKey={REFERENCES_COLLAPSED_KEY} />
    </div>
  );
}
