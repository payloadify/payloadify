"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { EXFIL_PLACEHOLDER_DOMAIN, XSS_ACTIONS, XSS_ACTIONS_BY_ID, XssActionId } from "@/lib/xss/actions";
import { COMMON_BLACKLIST_CHARS, unavoidableChars } from "@/lib/xss/blacklist";
import { LEVEL_ORDER, buildPayload, effectiveLevel, pickInjectionAndObfuscation } from "@/lib/xss/generate";
import { XSS_INJECTION_TYPES, XssContext, XssInjectionType, XssLevel } from "@/lib/xss/injectionTypes";
import { NONE_OBFUSCATION, OBFUSCATIONS, OBFUSCATIONS_BY_ID, Obfuscation, ObfuscationId } from "@/lib/xss/obfuscation";
import { canGenerate, pruneHistory } from "@/lib/xss/rateLimit";

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

const toggleButtonClasses = (active: boolean) =>
  `rounded border px-3 py-1.5 text-sm ${
    active
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
  }`;
const selectClasses =
  "rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const inputClasses =
  "w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function loadHistory(): number[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function saveHistory(history: number[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — rate limiting just falls
    // back to in-memory only for this tab session, which is an acceptable degradation.
  }
}

export function XssGeneratorTool() {
  const [level, setLevel] = useState<UiLevel>("basic");
  const [context, setContext] = useState<XssContext>("reflected-stored");
  const [maintainLevel, setMaintainLevel] = useState(true);
  const [actionId, setActionId] = useState<XssActionId>("alert");
  const [customInput, setCustomInput] = useState("");
  const [exfilDomain, setExfilDomain] = useState(EXFIL_PLACEHOLDER_DOMAIN);

  const [injectionSelect, setInjectionSelect] = useState<typeof RANDOM | string>(RANDOM);
  const [obfuscationSelect, setObfuscationSelect] = useState<typeof RANDOM | ObfuscationId>(RANDOM);
  const [blacklistCommon, setBlacklistCommon] = useState<Set<string>>(new Set());
  const [blacklistExtra, setBlacklistExtra] = useState("");

  const [generatedInjection, setGeneratedInjection] = useState<XssInjectionType | null>(null);
  const [generatedObfuscation, setGeneratedObfuscation] = useState<Obfuscation | null>(null);
  // localStorage doesn't exist during the static-export prerender, so this initializer only
  // reads real history once hydrated client-side; `history` never affects rendered JSX
  // directly, so there's no hydration mismatch to worry about.
  const [history, setHistory] = useState<number[]>(() =>
    typeof window === "undefined" ? [] : pruneHistory(loadHistory(), Date.now()),
  );
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const action = XSS_ACTIONS_BY_ID[actionId];
  const actionExpr = useMemo(
    () => action.build(actionId === "cookie-exfil" ? exfilDomain : customInput),
    [action, actionId, customInput, exfilDomain],
  );

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
  const unavoidableByObfuscation = useMemo(() => {
    if (obfuscationSelect === RANDOM) return new Set<string>();
    return unavoidableChars(OBFUSCATIONS_BY_ID[obfuscationSelect as ObfuscationId], actionExpr);
  }, [obfuscationSelect, actionExpr]);

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
  }

  function selectObfuscation(value: string) {
    setObfuscationSelect(value as typeof RANDOM | ObfuscationId);
    if (value !== RANDOM) setLevel("custom");
  }

  function generate() {
    const now = Date.now();
    const check = canGenerate(history, now);
    if (!check.allowed) {
      setBlockedMsg(`Rate limited — try again in ${Math.ceil(check.retryAfterMs / 1000)}s.`);
      return;
    }
    setBlockedMsg(null);
    const nextHistory = [...pruneHistory(history, now), now];
    setHistory(nextHistory);
    saveHistory(nextHistory);

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
      <Callout variant="warning">
        Use only on systems you own or are explicitly authorized to test.
      </Callout>

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
              onClick={() => setContext(c)}
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
          checked={maintainLevel}
          onChange={(e) => setMaintainLevel(e.target.checked)}
          disabled={level === "custom"}
        />
        Maintain level (uncheck to randomize across all levels)
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
        {actionId === "cookie-exfil" && (
          <input
            type="text"
            value={exfilDomain}
            onChange={(e) => setExfilDomain(e.target.value)}
            placeholder="Your Collaborator/webhook domain"
            spellCheck={false}
            className={`${inputClasses} mt-2`}
            aria-label="Exfiltration domain"
          />
        )}
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={
          (actionId === "custom" && customInput.length === 0) ||
          (actionId === "cookie-exfil" && exfilDomain.length === 0)
        }
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
