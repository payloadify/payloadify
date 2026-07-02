"use client";

import { useState } from "react";
import { ENCODING_OPERATIONS, ENCODING_OPERATIONS_BY_ID, EncodingOperationId } from "@/lib/encoding/operations";
import { computeChain, Direction, Step } from "@/lib/encoding/chain";
import { AUTO_DETECT_CHARSET, CHARSET_GROUPS, DEFAULT_CHARSET } from "@/lib/encoding/charsets";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";

let nextStepId = 1;

function defaultStep(): Step {
  return { id: nextStepId++, operationId: "base64", mode: "all", charset: DEFAULT_CHARSET };
}

const inputClasses =
  "w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const selectClasses =
  "rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const toggleButtonClasses = (active: boolean) =>
  `rounded border px-2 py-1.5 text-sm ${
    active
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
  }`;
const iconButtonClasses =
  "rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-600 hover:border-zinc-400 disabled:opacity-30 disabled:hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:disabled:hover:border-zinc-700";
const checkboxLabelClasses = "flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400";

export function PayloadEncoderTool({ direction }: { direction: Direction }) {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<Step[]>([defaultStep()]);

  const { results } = computeChain(input, steps, direction);

  function updateStep(id: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function setOperation(id: number, operationId: EncodingOperationId) {
    const operation = ENCODING_OPERATIONS_BY_ID[operationId];
    updateStep(id, { operationId, mode: operation.modes ? operation.modes[0].id : undefined });
  }

  function addStep() {
    setSteps((prev) => [...prev, defaultStep()]);
  }

  function removeStep(id: number) {
    setSteps((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  }

  function moveStep(index: number, delta: number) {
    setSteps((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="Type or paste the text to encode/decode"
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Computed entirely in your browser — this text is never sent anywhere.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const operation = ENCODING_OPERATIONS_BY_ID[step.operationId];
          const result = results[index];
          const isFinal = index === steps.length - 1;
          const chunkOn = (step.chunkWidth ?? 0) > 0;

          return (
            <div key={step.id} className="rounded border border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
                <select
                  value={step.operationId}
                  onChange={(e) => setOperation(step.id, e.target.value as EncodingOperationId)}
                  className={selectClasses}
                >
                  {ENCODING_OPERATIONS.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>

                {operation.modes && direction === "encode" && (
                  <select
                    value={step.mode}
                    onChange={(e) => updateStep(step.id, { mode: e.target.value })}
                    className={selectClasses}
                  >
                    {operation.modes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                )}

                {operation.supportsCharset && (
                  <select
                    value={step.charset ?? DEFAULT_CHARSET}
                    onChange={(e) => updateStep(step.id, { charset: e.target.value })}
                    className={selectClasses}
                  >
                    {direction === "decode" && <option value={AUTO_DETECT_CHARSET}>Auto-detect</option>}
                    {CHARSET_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.charsets
                          .filter((c) => direction === "decode" || c.encodable)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                )}

                {operation.supportsLineOptions && direction === "decode" && (
                  <label className={checkboxLabelClasses}>
                    <input
                      type="checkbox"
                      checked={step.lineMode ?? false}
                      onChange={(e) => updateStep(step.id, { lineMode: e.target.checked })}
                    />
                    Decode each line separately
                  </label>
                )}

                {operation.supportsLineOptions && direction === "encode" && (
                  <>
                    <label className={checkboxLabelClasses}>
                      <input
                        type="checkbox"
                        checked={step.encodeLineMode ?? false}
                        onChange={(e) => updateStep(step.id, { encodeLineMode: e.target.checked })}
                      />
                      Encode each line separately
                    </label>
                    <label className={checkboxLabelClasses}>
                      <input
                        type="checkbox"
                        checked={chunkOn}
                        onChange={(e) => updateStep(step.id, { chunkWidth: e.target.checked ? 76 : 0 })}
                      />
                      Split into chunks
                    </label>
                    {chunkOn && (
                      <input
                        type="number"
                        min={1}
                        value={step.chunkWidth}
                        onChange={(e) =>
                          updateStep(step.id, { chunkWidth: Math.max(1, Number(e.target.value) || 1) })
                        }
                        className={`${selectClasses} w-16`}
                        aria-label="Chunk width"
                      />
                    )}
                    {(step.encodeLineMode || chunkOn) && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateStep(step.id, { newlineSeparator: "LF" })}
                          className={toggleButtonClasses((step.newlineSeparator ?? "LF") === "LF")}
                        >
                          LF
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStep(step.id, { newlineSeparator: "CRLF" })}
                          className={toggleButtonClasses(step.newlineSeparator === "CRLF")}
                        >
                          CRLF
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, -1)}
                    disabled={index === 0}
                    className={iconButtonClasses}
                    aria-label="Move step up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 1)}
                    disabled={index === steps.length - 1}
                    className={iconButtonClasses}
                    aria-label="Move step down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    disabled={steps.length === 1}
                    className={iconButtonClasses}
                    aria-label="Remove step"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-3">
                {result.kind === "single" ? (
                  <>
                    {result.error !== null && <Callout variant="danger">{result.error}</Callout>}
                    {result.output === null && result.error === null && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Blocked — fix the error in an earlier step.
                      </p>
                    )}
                    {result.output !== null && (
                      <>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {isFinal ? "Final output" : `After step ${index + 1}`}
                        </p>
                        <div className="flex items-start justify-between gap-2">
                          <code className="break-all whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">
                            {result.output}
                          </code>
                          <CopyButton text={result.output} />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    {result.lines.map((line, lineIndex) =>
                      line.error !== null ? (
                        <Callout key={lineIndex} variant="danger">
                          Line {lineIndex + 1}: {line.error}
                        </Callout>
                      ) : (
                        <div key={lineIndex} className="flex items-start justify-between gap-2">
                          <code className="break-all text-xs text-zinc-600 dark:text-zinc-400">{line.output}</code>
                          <CopyButton text={line.output ?? ""} />
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addStep}
        className="self-start rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        + Add step
      </button>
    </div>
  );
}
