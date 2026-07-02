import { ENCODING_OPERATIONS_BY_ID, EncodingOperationId } from "./operations";

export type Direction = "encode" | "decode";

export type Step = {
  id: number;
  operationId: EncodingOperationId;
  /** html-entity / unicode-escape "which characters" toggle (encode direction only). */
  mode?: string;
  /** base64 / hex / url only. */
  charset?: string;
  /** Decode-each-line-separately (decode direction, line-options operations only). */
  lineMode?: boolean;
  /** Encode-each-line-separately (encode direction, line-options operations only). */
  encodeLineMode?: boolean;
  /** 0 (or unset) = off. Encode direction, line-options operations only. */
  chunkWidth?: number;
  newlineSeparator?: "LF" | "CRLF";
};

export type StepResult =
  | { kind: "single"; output: string | null; error: string | null }
  | { kind: "lines"; lines: { output: string | null; error: string | null }[] };

const LINE_SPLIT = /\r\n|\r|\n/;

function separatorString(step: Step): string {
  return step.newlineSeparator === "CRLF" ? "\r\n" : "\n";
}

function chunkString(str: string, width: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += width) {
    chunks.push(str.slice(i, i + width));
  }
  return chunks.length > 0 ? chunks : [""];
}

/** Encode operations never throw (any string encodes successfully), so this always produces a
 *  single result — unlike decode line-mode, there's no per-unit success/failure to isolate. */
function computeEncodeStep(current: string, step: Step): StepResult {
  const operation = ENCODING_OPERATIONS_BY_ID[step.operationId];
  const options = { mode: step.mode, charset: step.charset };
  const width = step.chunkWidth ?? 0;

  if (!operation.supportsLineOptions || (!step.encodeLineMode && width <= 0)) {
    return { kind: "single", output: operation.encode(current, options), error: null };
  }

  const units = step.encodeLineMode ? current.split(LINE_SPLIT) : [current];
  const encodedUnits = units.map((u) => operation.encode(u, options));
  const sep = separatorString(step);
  const wrapped = width > 0 ? encodedUnits.map((u) => chunkString(u, width).join(sep)) : encodedUnits;
  return { kind: "single", output: wrapped.join(sep), error: null };
}

function decodeOne(operation: (typeof ENCODING_OPERATIONS_BY_ID)[string], input: string, options: object) {
  try {
    return { output: operation.decode(input, options), error: null };
  } catch (err) {
    return { output: null, error: err instanceof Error ? err.message : "Invalid input." };
  }
}

function computeDecodeStep(current: string, step: Step): StepResult {
  const operation = ENCODING_OPERATIONS_BY_ID[step.operationId];
  const options = { mode: step.mode, charset: step.charset };

  if (!(operation.supportsLineOptions && step.lineMode)) {
    const { output, error } = decodeOne(operation, current, options);
    return { kind: "single", output, error };
  }

  const lines = current.split(LINE_SPLIT).map((line) => decodeOne(operation, line, options));
  return { kind: "lines", lines };
}

/** The successfully-decoded lines rejoined with \n — failed lines are dropped rather than
 *  forwarded, since a raw undecoded line would silently corrupt the next step's input. If every
 *  line failed, propagate null so downstream steps show "blocked", matching whole-step failure. */
function propagatedValue(result: StepResult): string | null {
  if (result.kind === "single") return result.output;
  const successes = result.lines.filter((l): l is { output: string; error: null } => l.output !== null);
  return successes.length > 0 ? successes.map((l) => l.output).join("\n") : null;
}

export function computeChain(input: string, steps: Step[], direction: Direction): { results: StepResult[] } {
  const results: StepResult[] = [];
  let current: string | null = input;
  for (const step of steps) {
    if (current === null) {
      results.push({ kind: "single", output: null, error: null });
      continue;
    }
    const result = direction === "encode" ? computeEncodeStep(current, step) : computeDecodeStep(current, step);
    results.push(result);
    current = propagatedValue(result);
  }
  return { results };
}
