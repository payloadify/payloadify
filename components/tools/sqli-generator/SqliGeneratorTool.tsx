"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { iconButtonClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CHARSET_GROUPS, DEFAULT_CHARSET } from "@/lib/encoding/charsets";
import { ENCODING_OPERATIONS, ENCODING_OPERATIONS_BY_ID, EncodingOperationId } from "@/lib/encoding/operations";
import { COMMON_BLACKLIST_CHARS, unavoidableChars } from "@/lib/sqli/blacklist";
import { SqliContext } from "@/lib/sqli/context";
import { SQL_DIALECTS, SQL_DIALECTS_BY_ID, SqlDialect, SqlDialectId } from "@/lib/sqli/dialects";
import { LEVEL_ORDER, buildPayload, effectiveLevel, pickTechniqueAndObfuscation } from "@/lib/sqli/generate";
import { SQLI_INFO_TARGETS, SQLI_INFO_TARGETS_BY_ID, SqliInfoTargetId } from "@/lib/sqli/infoTargets";
import { NONE_SQLI_OBFUSCATION, SQLI_OBFUSCATIONS, SQLI_OBFUSCATIONS_BY_ID, SqliObfuscation, SqliObfuscationId } from "@/lib/sqli/obfuscation";
import { SQLI_TECHNIQUES, SqliLevel, SqliTechnique } from "@/lib/sqli/techniques";
import { canGenerate, pruneHistory } from "@/lib/rateLimit/rateLimit";
import { loadHistory, saveHistory } from "@/lib/storage/generationHistory";

const HISTORY_KEY = "payloadify:sqli-generator:history";
const QUOTE = "'";
const RANDOM = "random" as const;
/** UNION SELECT pads the info expression with this many NULL columns — capped well above any
 *  realistic original-query column count to keep `Array(padCount).fill(...)` from ever being
 *  asked to build a pathologically large array from a mistyped/pasted value. */
const MAX_COLUMN_COUNT = 64;

const ENCODABLE_CHARSETS = CHARSET_GROUPS.flatMap((group) => group.charsets).filter((c) => c.encodable);

type UiLevel = SqliLevel | "custom";
const LEVEL_BUTTONS: UiLevel[] = [...LEVEL_ORDER, "custom"];

const LEVEL_LABELS: Record<UiLevel, string> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
  custom: "Custom",
};

const CONTEXT_LABELS: Record<SqliContext, string> = {
  numeric: "Numeric parameter",
  string: "String parameter",
  search: "Search / LIKE parameter",
};

let nextFieldId = 1;
type SqliInfoField = { id: number; targetId: SqliInfoTargetId; customExpr?: string };
function defaultInfoField(): SqliInfoField {
  return { id: nextFieldId++, targetId: "dbVersion" };
}

/** Probes `technique`/`obfuscation` against `dialect` with a placeholder expression, purely to
 *  test dialect capability (not the user's actual field selection) — used to filter the dropdown
 *  options down to what's actually usable on the currently-selected dialect. */
function techniqueSupportsDialect(technique: SqliTechnique, dialect: SqlDialect): boolean {
  const probeExpr = technique.usesInfoExpr ? "x" : null;
  return technique.render(dialect, probeExpr, QUOTE, "string", 1) !== null;
}
function obfuscationSupportsDialect(obfuscation: SqliObfuscation, dialect: SqlDialect): boolean {
  return obfuscation.apply("x", dialect, QUOTE) !== null;
}

export function SqliGeneratorTool() {
  const [dialectId, setDialectId] = useState<SqlDialectId>("mysql");
  const [level, setLevel] = useState<UiLevel>("basic");
  const [context, setContext] = useState<SqliContext>("string");
  const [maintainLevel, setMaintainLevel] = useState(true);

  const [infoFields, setInfoFields] = useState<SqliInfoField[]>([defaultInfoField()]);
  const [columnCount, setColumnCount] = useState(1);

  const [techniqueSelect, setTechniqueSelect] = useState<typeof RANDOM | string>(RANDOM);
  const [obfuscationSelect, setObfuscationSelect] = useState<typeof RANDOM | SqliObfuscationId>(RANDOM);
  const [blacklistCommon, setBlacklistCommon] = useState<Set<string>>(new Set());
  const [blacklistExtra, setBlacklistExtra] = useState("");

  const [finalEncoding, setFinalEncoding] = useState<"none" | EncodingOperationId>("none");
  const [finalEncodingMode, setFinalEncodingMode] = useState<string | undefined>(undefined);
  const [finalEncodingCharset, setFinalEncodingCharset] = useState(DEFAULT_CHARSET);

  const [generatedTechnique, setGeneratedTechnique] = useState<SqliTechnique | null>(null);
  const [generatedObfuscation, setGeneratedObfuscation] = useState<SqliObfuscation | null>(null);
  const [history, setHistory] = useState<number[]>(() =>
    typeof window === "undefined" ? [] : pruneHistory(loadHistory(HISTORY_KEY), Date.now()),
  );
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const dialect = SQL_DIALECTS_BY_ID[dialectId];

  const blacklist = useMemo(
    () => new Set<string>([...blacklistCommon, ...Array.from(blacklistExtra)]),
    [blacklistCommon, blacklistExtra],
  );

  const resolvedInfoFields = useMemo(
    () =>
      infoFields.map((f) => ({
        ...f,
        resolved: SQLI_INFO_TARGETS_BY_ID[f.targetId].resolve(dialect, f.customExpr),
      })),
    [infoFields, dialect],
  );
  const combinedInfoExpr = useMemo(() => {
    const resolvedValues = resolvedInfoFields.map((f) => f.resolved).filter((r): r is string => r !== null);
    if (resolvedValues.length === 0) return null;
    const parts: string[] = [];
    resolvedValues.forEach((v, i) => {
      if (i > 0) parts.push(dialect.separatorLiteral);
      parts.push(v);
    });
    return dialect.concat(parts);
  }, [resolvedInfoFields, dialect]);

  const techniqueOptions = useMemo(
    () => SQLI_TECHNIQUES.filter((t) => t.contexts.includes(context) && techniqueSupportsDialect(t, dialect)),
    [context, dialect],
  );
  const chosenTechnique = techniqueSelect === RANDOM ? undefined : techniqueOptions.find((t) => t.id === techniqueSelect);
  const obfuscationOptions = useMemo(() => {
    const dialectCompatible = SQLI_OBFUSCATIONS.filter((o) => obfuscationSupportsDialect(o, dialect));
    if (techniqueSelect === RANDOM) return dialectCompatible;
    if (chosenTechnique && !chosenTechnique.usesInfoExpr) return [NONE_SQLI_OBFUSCATION];
    return dialectCompatible;
  }, [dialect, techniqueSelect, chosenTechnique]);

  const unavoidableByObfuscation = useMemo(() => {
    if (obfuscationSelect === RANDOM) return new Set<string>();
    return unavoidableChars(SQLI_OBFUSCATIONS_BY_ID[obfuscationSelect], dialect, combinedInfoExpr);
  }, [obfuscationSelect, dialect, combinedInfoExpr]);

  const adapted = useMemo(() => {
    if (!generatedTechnique) return null;
    try {
      return buildPayload(
        generatedTechnique,
        generatedObfuscation ?? NONE_SQLI_OBFUSCATION,
        dialect,
        combinedInfoExpr,
        context,
        columnCount,
        blacklist,
      );
    } catch {
      // The generated technique stopped being supported on the current dialect/context (e.g. the
      // user changed dialect after generating) — treat as "nothing generated yet" rather than crash.
      return null;
    }
  }, [generatedTechnique, generatedObfuscation, dialect, combinedInfoExpr, context, columnCount, blacklist]);

  const finalPayload = useMemo(() => {
    if (!adapted) return null;
    if (finalEncoding === "none") return adapted.payload;
    const operation = ENCODING_OPERATIONS_BY_ID[finalEncoding];
    try {
      return operation.encode(adapted.payload, { mode: finalEncodingMode, charset: finalEncodingCharset });
    } catch {
      return adapted.payload;
    }
  }, [adapted, finalEncoding, finalEncodingMode, finalEncodingCharset]);

  function toggleBlacklistChar(char: string) {
    setBlacklistCommon((prev) => {
      const next = new Set(prev);
      if (next.has(char)) next.delete(char);
      else next.add(char);
      return next;
    });
  }

  function resetGenerated() {
    setGeneratedTechnique(null);
    setGeneratedObfuscation(null);
  }

  function selectLevel(l: UiLevel) {
    setLevel(l);
    if (l !== "custom") {
      setTechniqueSelect(RANDOM);
      setObfuscationSelect(RANDOM);
    }
  }

  function selectDialect(id: SqlDialectId) {
    setDialectId(id);
    resetGenerated();
    const newDialect = SQL_DIALECTS_BY_ID[id];
    if (techniqueSelect !== RANDOM) {
      const chosen = SQLI_TECHNIQUES.find((t) => t.id === techniqueSelect);
      const stillValid = chosen ? chosen.contexts.includes(context) && techniqueSupportsDialect(chosen, newDialect) : false;
      if (!stillValid) {
        // techniqueSelect !== RANDOM only happens after selectTechnique forced level to "custom",
        // so dropping the pin here means "custom" no longer means anything — revert the level
        // label too, rather than leaving it stuck on "Custom" while generation is actually random.
        setTechniqueSelect(RANDOM);
        setObfuscationSelect(RANDOM);
        setLevel("basic");
        return;
      }
    }
    if (obfuscationSelect !== RANDOM && !obfuscationSupportsDialect(SQLI_OBFUSCATIONS_BY_ID[obfuscationSelect], newDialect)) {
      setObfuscationSelect(RANDOM);
      setLevel("basic");
    }
  }

  function selectContext(c: SqliContext) {
    setContext(c);
    resetGenerated();
    if (techniqueSelect !== RANDOM) {
      const stillValid = SQLI_TECHNIQUES.some((t) => t.id === techniqueSelect && t.contexts.includes(c));
      if (!stillValid) {
        // Same reasoning as selectDialect above — the pin that put us in "custom" no longer holds.
        setTechniqueSelect(RANDOM);
        setObfuscationSelect(RANDOM);
        setLevel("basic");
      }
    }
  }

  function selectTechnique(value: string) {
    setTechniqueSelect(value);
    if (value !== RANDOM) setLevel("custom");
    if (obfuscationSelect !== RANDOM) {
      const chosen = value === RANDOM ? undefined : SQLI_TECHNIQUES.find((t) => t.id === value);
      const stillValid = chosen && !chosen.usesInfoExpr ? obfuscationSelect === "none" : true;
      if (!stillValid) setObfuscationSelect(RANDOM);
    }
  }

  function selectObfuscation(value: string) {
    setObfuscationSelect(value as typeof RANDOM | SqliObfuscationId);
    if (value !== RANDOM) setLevel("custom");
  }

  function addInfoField() {
    setInfoFields((prev) => [...prev, defaultInfoField()]);
  }
  function removeInfoField(id: number) {
    setInfoFields((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));
  }
  function updateInfoField(id: number, patch: Partial<SqliInfoField>) {
    setInfoFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function generate() {
    const now = Date.now();
    const check = canGenerate(history, now);
    if (!check.allowed) {
      setBlockedMsg(`Rate limited — try again in ${Math.ceil(check.retryAfterMs / 1000)}s.`);
      return;
    }
    setBlockedMsg(null);

    const effMaintain = level === "custom" ? false : maintainLevel;
    const presetLevel: SqliLevel = level === "custom" ? "advanced" : level;

    const fixedTechnique = techniqueSelect === RANDOM ? undefined : SQLI_TECHNIQUES.find((t) => t.id === techniqueSelect);
    const fixedObfuscation = obfuscationSelect === RANDOM ? undefined : SQLI_OBFUSCATIONS_BY_ID[obfuscationSelect];

    try {
      const { technique: nextTechnique, obfuscation: nextObfuscation } = pickTechniqueAndObfuscation(
        presetLevel,
        context,
        effMaintain,
        dialect,
        combinedInfoExpr,
        columnCount,
        blacklist,
        fixedTechnique,
        fixedObfuscation,
      );
      setGeneratedTechnique(nextTechnique);
      setGeneratedObfuscation(nextObfuscation);

      // Only count successful generations against the rate limit — a combination with no valid
      // technique never produces a payload, so it shouldn't burn the user's cooldown/quota.
      const nextHistory = [...pruneHistory(history, now), now];
      setHistory(nextHistory);
      saveHistory(HISTORY_KEY, nextHistory);
    } catch {
      // No technique in the pool is supported for this dialect/level/context combination — e.g.
      // Advanced + Oracle + no valid info field leaves every advanced technique unsupported.
      setBlockedMsg("No technique is available for this combination of dialect, level, and context — try a different level, context, or info field.");
    }
  }

  const encodingOperation = finalEncoding === "none" ? null : ENCODING_OPERATIONS_BY_ID[finalEncoding];

  return (
    <div className="flex flex-col gap-6">
      <Callout variant="warning">Use only on systems you own or are explicitly authorized to test.</Callout>

      <div>
        <label className="mb-1 block text-sm font-medium">SQL dialect</label>
        <div className="flex flex-wrap gap-1">
          {SQL_DIALECTS.map((d) => (
            <button key={d.id} type="button" onClick={() => selectDialect(d.id)} className={toggleButtonClasses(dialectId === d.id)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Level</label>
        <div className="flex gap-1">
          {LEVEL_BUTTONS.map((l) => (
            <button key={l} type="button" onClick={() => selectLevel(l)} className={toggleButtonClasses(level === l)}>
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Picking a specific technique or obfuscation below switches this to Custom automatically.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Injection point</label>
        <div className="flex gap-1">
          {(Object.keys(CONTEXT_LABELS) as SqliContext[]).map((c) => (
            <button key={c} type="button" onClick={() => selectContext(c)} className={toggleButtonClasses(context === c)}>
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
          <label className="mb-1 block text-sm font-medium">Technique</label>
          <select value={techniqueSelect} onChange={(e) => selectTechnique(e.target.value)} className={selectClasses}>
            <option value={RANDOM}>Random (based on level)</option>
            {techniqueOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {chosenTechnique && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{chosenTechnique.technique}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Obfuscation</label>
          <select value={obfuscationSelect} onChange={(e) => selectObfuscation(e.target.value)} className={selectClasses}>
            <option value={RANDOM}>Random (based on level)</option>
            {obfuscationOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {obfuscationSelect !== RANDOM && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{SQLI_OBFUSCATIONS_BY_ID[obfuscationSelect].description}</p>
          )}
        </div>
      </div>

      {(chosenTechnique?.columnCountAware || generatedTechnique?.columnCountAware) && (
        <div>
          <label className="mb-1 block text-sm font-medium">Original query column count</label>
          <input
            type="number"
            min={1}
            max={MAX_COLUMN_COUNT}
            step={1}
            value={columnCount}
            onChange={(e) => {
              const parsed = Math.round(Number(e.target.value));
              setColumnCount(Number.isFinite(parsed) ? Math.min(MAX_COLUMN_COUNT, Math.max(1, parsed)) : 1);
            }}
            className={`${selectClasses} w-24`}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            UNION SELECT must return the same number of columns as the original query — pad with the count you&apos;ve probed for (e.g. via ORDER
            BY). Max {MAX_COLUMN_COUNT}.
          </p>
        </div>
      )}

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
                <input type="checkbox" checked={blacklistCommon.has(char)} disabled={unavoidable} onChange={() => toggleBlacklistChar(char)} />
                {label}
              </label>
            );
          })}
        </div>
        <input
          type="text"
          value={blacklistExtra}
          onChange={(e) => setBlacklistExtra(e.target.value)}
          placeholder="Additional blacklisted characters, typed directly"
          className={`${inputClasses} mt-2`}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          The generator picks the obfuscation that avoids these characters where possible.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Info to extract</label>
        <div className="flex flex-col gap-2">
          {infoFields.map((field) => {
            const target = SQLI_INFO_TARGETS_BY_ID[field.targetId];
            const unavailable = field.targetId !== "custom" && target.resolve(dialect) === null;
            return (
              <div key={field.id} className="flex flex-wrap items-center gap-2">
                <select
                  value={field.targetId}
                  onChange={(e) => updateInfoField(field.id, { targetId: e.target.value as SqliInfoTargetId })}
                  className={selectClasses}
                >
                  {SQLI_INFO_TARGETS.map((t) => (
                    <option key={t.id} value={t.id} disabled={t.id !== "custom" && t.resolve(dialect) === null}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {field.targetId === "custom" && (
                  <input
                    type="text"
                    value={field.customExpr ?? ""}
                    onChange={(e) => updateInfoField(field.id, { customExpr: e.target.value })}
                    placeholder="Raw SQL expression, e.g. password"
                    className={`${inputClasses} w-auto flex-1`}
                  />
                )}
                {unavailable && <span className="text-xs text-amber-600 dark:text-amber-400">Not available on {dialect.label}</span>}
                <button
                  type="button"
                  onClick={() => removeInfoField(field.id)}
                  disabled={infoFields.length === 1}
                  className={iconButtonClasses}
                  aria-label="Remove info field"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addInfoField}
          className="mt-2 self-start rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          + Add info
        </button>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Only UNION-based, error-based, and boolean-based-blind techniques use this — tautology, time-based blind, and stacked queries
          don&apos;t extract data. Chaining multiple fields fully applies to UNION-based/error-based only; boolean-blind uses just the first
          field.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Final encoding</label>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={finalEncoding}
            onChange={(e) => {
              const value = e.target.value as "none" | EncodingOperationId;
              setFinalEncoding(value);
              const op = value === "none" ? null : ENCODING_OPERATIONS_BY_ID[value];
              setFinalEncodingMode(op?.modes ? op.modes[0].id : undefined);
            }}
            className={selectClasses}
          >
            <option value="none">None</option>
            {ENCODING_OPERATIONS.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
          {encodingOperation?.modes && (
            <select value={finalEncodingMode} onChange={(e) => setFinalEncodingMode(e.target.value)} className={selectClasses}>
              {encodingOperation.modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
          {encodingOperation?.supportsCharset && (
            <select value={finalEncodingCharset} onChange={(e) => setFinalEncodingCharset(e.target.value)} className={selectClasses}>
              {ENCODABLE_CHARSETS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Applied to the whole rendered payload as a final transport-layer step — e.g. URL-encoding for a GET parameter. Blacklist checking above
          applies to the raw SQL, not this final-encoded output.
        </p>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={combinedInfoExpr === null && chosenTechnique !== undefined && chosenTechnique.usesInfoExpr}
        className="self-start rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Generate payload
      </button>

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!adapted && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate payload.</Callout>}

      {adapted && generatedTechnique && generatedObfuscation && finalPayload !== null && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Generated payload</p>
            <CopyButton text={finalPayload} />
          </div>
          <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
            {finalPayload}
          </code>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {LEVEL_LABELS[effectiveLevel(generatedTechnique, generatedObfuscation)]} · {dialect.label} · {CONTEXT_LABELS[context]} ·{" "}
            {generatedTechnique.technique}
            {generatedObfuscation.id !== "none" && <> · {generatedObfuscation.label}</>}
          </p>

          {generatedTechnique.id === "stacked-queries" && (
            <Callout variant="warning">
              Only works if the vulnerable application&apos;s code path executes multi-statement queries — many DB drivers/APIs block this by
              default, so this technique is less reliable than the others.
            </Callout>
          )}

          {!adapted.obfuscationApplied && generatedObfuscation.id !== "none" && (
            <Callout variant="info">
              &ldquo;{generatedObfuscation.label}&rdquo; doesn&apos;t apply to this dialect/expression, so the payload is shown without it.
            </Callout>
          )}

          {adapted.violations.length > 0 && (
            <Callout variant="warning">
              Couldn&apos;t fully avoid the blacklisted character(s) <code>{adapted.violations.join(" ")}</code> with this technique/obfuscation
              combination — try a different one.
            </Callout>
          )}
        </div>
      )}
    </div>
  );
}
