"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { CopyButton } from "@/components/ui/CopyButton";
import { inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { XSS_ACTIONS, XSS_ACTIONS_BY_ID, XssActionId } from "@/lib/xss/actions";
import { COMMON_BLACKLIST_CHARS, unavoidableChars } from "@/lib/xss/blacklist";
import { LEVEL_ORDER, buildPayload, effectiveLevel, pickInjectionAndObfuscation } from "@/lib/xss/generate";
import { XSS_INJECTION_TYPES, XssContext, XssInjectionType, XssLevel } from "@/lib/xss/injectionTypes";
import { NONE_OBFUSCATION, OBFUSCATIONS, OBFUSCATIONS_BY_ID, Obfuscation, ObfuscationId } from "@/lib/xss/obfuscation";

const HISTORY_KEY = "payloadify:xss-generator:history";

type UiLevel = XssLevel | "custom";
const LEVEL_BUTTONS: UiLevel[] = [...LEVEL_ORDER, "custom"];

const LEVEL_LABELS: Record<UiLevel, string> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
  custom: "Custom",
};

const CONTEXT_LABELS: Record<XssContext, string> = {
  "reflected-stored": "Reflected / Stored",
  dom: "DOM-based",
};

const RANDOM = "random" as const;

export function XssGeneratorTool() {
  const [level, setLevel] = useState<UiLevel>("basic");
  const [context, setContext] = useState<XssContext>("reflected-stored");
  const [maintainLevel, setMaintainLevel] = useState(true);
  const [actionId, setActionId] = useState<XssActionId>("alert");
  const [customInput, setCustomInput] = useState("");

  const [injectionSelect, setInjectionSelect] = useState<typeof RANDOM | string>(RANDOM);
  const [obfuscationSelect, setObfuscationSelect] = useState<typeof RANDOM | ObfuscationId>(RANDOM);
  const [blacklistCommon, setBlacklistCommon] = useState<Set<string>>(new Set());
  const [blacklistExtra, setBlacklistExtra] = useState("");

  const [generatedInjection, setGeneratedInjection] = useState<XssInjectionType | null>(null);
  const [generatedObfuscation, setGeneratedObfuscation] = useState<Obfuscation | null>(null);
  const { blockedMsg, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  const action = XSS_ACTIONS_BY_ID[actionId];
  const actionExpr = useMemo(() => action.build(customInput), [action, customInput]);

  const blacklist = useMemo(
    () => new Set<string>([...blacklistCommon, ...Array.from(blacklistExtra)]),
    [blacklistCommon, blacklistExtra],
  );

  const injectionOptions = useMemo(
    () => XSS_INJECTION_TYPES.filter((t) => t.contexts.includes(context)),
    [context],
  );
  const obfuscationOptions = useMemo(() => {
    if (injectionSelect === RANDOM) return OBFUSCATIONS;
    const chosen = XSS_INJECTION_TYPES.find((t) => t.id === injectionSelect);
    return chosen ? OBFUSCATIONS.filter((o) => o.slots.includes(chosen.slot)) : OBFUSCATIONS;
  }, [injectionSelect]);

  // Characters the currently-selected obfuscation always emits no matter which JS-string quote
  // is picked — blacklisting them would never actually be honored, so their checkboxes grey out.
  // Debounced so typing in the custom-input/exfil-domain fields doesn't re-run this on every keystroke.
  const debouncedActionExpr = useDebouncedValue(actionExpr, 200);
  const unavoidableByObfuscation = useMemo(() => {
    if (obfuscationSelect === RANDOM) return new Set<string>();
    return unavoidableChars(OBFUSCATIONS_BY_ID[obfuscationSelect as ObfuscationId], debouncedActionExpr);
  }, [obfuscationSelect, debouncedActionExpr]);

  const adapted = useMemo(() => {
    if (!generatedInjection) return null;
    return buildPayload(generatedInjection, generatedObfuscation ?? NONE_OBFUSCATION, actionExpr, blacklist);
  }, [generatedInjection, generatedObfuscation, actionExpr, blacklist]);

  function toggleBlacklistChar(char: string) {
    setBlacklistCommon((prev) => {
      const next = new Set(prev);
      if (next.has(char)) next.delete(char);
      else next.add(char);
      return next;
    });
  }

  function selectLevel(l: UiLevel) {
    setLevel(l);
    if (l !== "custom") {
      setInjectionSelect(RANDOM);
      setObfuscationSelect(RANDOM);
    }
  }

  function selectInjection(value: string) {
    setInjectionSelect(value);
    if (value !== RANDOM) setLevel("custom");

    // A previously-pinned obfuscation may not apply to this injection type's slot (e.g.
    // "HTML-entity encode" only works in "attribute" slots) — drop it back to Random rather
    // than silently forcing an incompatible, non-functional combination into the payload.
    if (obfuscationSelect !== RANDOM) {
      const chosen = value === RANDOM ? undefined : XSS_INJECTION_TYPES.find((t) => t.id === value);
      const stillValid = chosen
        ? OBFUSCATIONS_BY_ID[obfuscationSelect as ObfuscationId].slots.includes(chosen.slot)
        : true;
      if (!stillValid) setObfuscationSelect(RANDOM);
    }
  }

  function selectObfuscation(value: string) {
    setObfuscationSelect(value as typeof RANDOM | ObfuscationId);
    if (value !== RANDOM) setLevel("custom");
  }

  function selectContext(c: XssContext) {
    setContext(c);

    // A previously-pinned injection type may not exist in the new context (e.g. "javascript:
    // URI" is DOM-only) — drop it back to Random rather than silently generating a payload for
    // a context the UI no longer shows as selected.
    if (injectionSelect !== RANDOM) {
      const stillValid = XSS_INJECTION_TYPES.some((t) => t.id === injectionSelect && t.contexts.includes(c));
      if (!stillValid) {
        setInjectionSelect(RANDOM);
        setObfuscationSelect(RANDOM);
      }
    }
  }

  function generate() {
    const check = checkAndClear();
    if (!check.allowed) return;
    recordGeneration(check.now);

    // "Custom" has no level tier to constrain randomization by, so any axis still left on
    // "random" draws from the full basic-through-advanced pool.
    const effMaintain = level === "custom" ? false : maintainLevel;
    const presetLevel: XssLevel = level === "custom" ? "advanced" : level;

    const fixedInjection =
      injectionSelect === RANDOM ? undefined : XSS_INJECTION_TYPES.find((t) => t.id === injectionSelect)!;
    const fixedObfuscation =
      obfuscationSelect === RANDOM ? undefined : OBFUSCATIONS_BY_ID[obfuscationSelect as ObfuscationId];

    // When either axis is left on "random", prefer a combination that fully avoids the
    // blacklist over one that merely reports violations after the fact.
    const { injection: nextInjection, obfuscation: nextObfuscation } = pickInjectionAndObfuscation(
      presetLevel,
      context,
      effMaintain,
      actionExpr,
      blacklist,
      fixedInjection,
      fixedObfuscation,
    );

    setGeneratedInjection(nextInjection);
    setGeneratedObfuscation(nextObfuscation);
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <div>
        <label className="mb-1 block text-sm font-medium">Level</label>
        <div className="flex gap-1">
          {LEVEL_BUTTONS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => selectLevel(l)}
              className={toggleButtonClasses(level === l)}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Picking a specific injection type or obfuscation below switches this to Custom automatically.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">XSS type</label>
        <div className="flex gap-1">
          {(Object.keys(CONTEXT_LABELS) as XssContext[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => selectContext(c)}
              className={toggleButtonClasses(context === c)}
            >
              {CONTEXT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={level === "custom" ? false : maintainLevel}
          onChange={(e) => setMaintainLevel(e.target.checked)}
          disabled={level === "custom"}
        />
        Maintain level (uncheck to randomize across all levels)
        {level === "custom" && " — always off in Custom, since there's no level tier to maintain"}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Injection type</label>
          <select
            value={injectionSelect}
            onChange={(e) => selectInjection(e.target.value)}
            className={selectClasses}
          >
            <option value={RANDOM}>Random (based on level)</option>
            {injectionOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Obfuscation</label>
          <select
            value={obfuscationSelect}
            onChange={(e) => selectObfuscation(e.target.value)}
            className={selectClasses}
          >
            <option value={RANDOM}>Random (based on level)</option>
            {obfuscationOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {obfuscationSelect !== RANDOM && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {OBFUSCATIONS_BY_ID[obfuscationSelect as ObfuscationId].description}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Blacklisted characters</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_BLACKLIST_CHARS.map(({ char, label }) => {
            const unavoidable = unavoidableByObfuscation.has(char);
            return (
              <label
                key={char}
                title={
                  unavoidable
                    ? `The selected obfuscation always includes "${label}" — blacklisting it won't change the output.`
                    : undefined
                }
                className={`flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 ${
                  unavoidable ? "opacity-40" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={blacklistCommon.has(char)}
                  disabled={unavoidable}
                  onChange={() => toggleBlacklistChar(char)}
                />
                {label}
              </label>
            );
          })}
        </div>
        <input
          type="text"
          value={blacklistExtra}
          onChange={(e) => setBlacklistExtra(e.target.value)}
          placeholder="Additional blacklisted characters, typed directly (e.g. {})"
          className={`${inputClasses} mt-2`}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          The generator picks the quote style and encoding that avoids these characters where possible.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Action</label>
        <select
          value={actionId}
          onChange={(e) => setActionId(e.target.value as XssActionId)}
          className={selectClasses}
        >
          {XSS_ACTIONS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{action.description}</p>
        {actionId === "custom" && (
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="What to reflect, e.g. alert(document.domain)"
            className={`${inputClasses} mt-2`}
          />
        )}
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={actionId === "custom" && customInput.length === 0}
        className="self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Generate payload
      </button>

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!adapted && !blockedMsg && (
        <Callout variant="info">Pick your options above, then click Generate payload.</Callout>
      )}

      {adapted && generatedInjection && generatedObfuscation && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Generated payload
            </p>
            <CopyButton text={adapted.payload} />
          </div>
          <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
            {adapted.payload}
          </code>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {LEVEL_LABELS[effectiveLevel(generatedInjection, generatedObfuscation)]} · {CONTEXT_LABELS[context]} ·{" "}
            {generatedInjection.technique}
            {generatedObfuscation.id !== "none" && <> · {generatedObfuscation.label}</>}
          </p>

          {!adapted.obfuscationApplied && generatedObfuscation.id !== "none" && (
            <Callout variant="info">
              &ldquo;{generatedObfuscation.label}&rdquo; doesn&apos;t apply to this action expression, so the
              payload is shown without it. String-concatenation and backtick-call obfuscation only work on a
              plain <code>name(args)</code> call.
            </Callout>
          )}

          {adapted.violations.length > 0 && (
            <Callout variant="warning">
              Couldn&apos;t fully avoid the blacklisted character(s){" "}
              <code>{adapted.violations.join(" ")}</code> with this injection type/obfuscation combination — try
              a different one.
            </Callout>
          )}
        </div>
      )}
    </div>
  );
}
