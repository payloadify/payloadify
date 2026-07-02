import { SqliContext } from "./context";
import { SqlDialect } from "./dialects";
import { AdaptedSqliPayload, buildAdaptedPayload } from "./blacklist";
import { NONE_SQLI_OBFUSCATION, SQLI_OBFUSCATIONS, SqliObfuscation } from "./obfuscation";
import { SQLI_TECHNIQUES, SqliLevel, SqliTechnique } from "./techniques";

const LEVEL_ORDER: SqliLevel[] = ["basic", "intermediate", "advanced"];
const LEVEL_RANK: Record<SqliLevel, number> = { basic: 0, intermediate: 1, advanced: 2 };

const QUOTE = "'";

/** The higher-ranked of the technique's and obfuscation's own level — an advanced obfuscation on
 *  top of a basic technique still counts as an advanced payload overall. */
export function effectiveLevel(technique: SqliTechnique, obfuscation: SqliObfuscation): SqliLevel {
  return LEVEL_RANK[technique.level] >= LEVEL_RANK[obfuscation.level] ? technique.level : obfuscation.level;
}

/** Techniques that don't consume the info expression at all (tautology, time-based blind,
 *  stacked queries) have nothing for an obfuscation to transform, so only "None" is offered —
 *  picking any other obfuscation for them would be a no-op. */
function eligibleObfuscations(
  level: SqliLevel,
  technique: SqliTechnique,
  maintainLevel: boolean,
  dialect: SqlDialect,
  infoExpr: string | null,
): SqliObfuscation[] {
  if (!technique.usesInfoExpr) return [NONE_SQLI_OBFUSCATION];
  return SQLI_OBFUSCATIONS.filter(
    (o) => (!maintainLevel || o.level === level) && (infoExpr === null || o.apply(infoExpr, dialect, QUOTE) !== null),
  );
}

/** Randomly picks a technique and/or obfuscation (honoring any `fixedTechnique`/
 *  `fixedObfuscation` pinned by the user), preferring a combination that fully avoids the
 *  blacklist when one exists among the eligible pool. Falls back to any eligible combination
 *  when none can avoid the blacklist, so the UI still gets a payload (with violations reported)
 *  rather than nothing at all. */
export function pickTechniqueAndObfuscation(
  level: SqliLevel,
  context: SqliContext,
  maintainLevel: boolean,
  dialect: SqlDialect,
  infoExpr: string | null,
  columnCount: number,
  blacklist: ReadonlySet<string>,
  fixedTechnique?: SqliTechnique,
  fixedObfuscation?: SqliObfuscation,
): { technique: SqliTechnique; obfuscation: SqliObfuscation } {
  const techniquePool = fixedTechnique
    ? [fixedTechnique]
    : SQLI_TECHNIQUES.filter(
        (t) =>
          t.contexts.includes(context) &&
          (!maintainLevel || t.level === level) &&
          t.render(dialect, infoExpr, QUOTE, context, columnCount) !== null,
      );
  if (techniquePool.length === 0) {
    throw new Error(
      `No SQLi techniques available for dialect "${dialect.id}", context "${context}"${maintainLevel ? `, level "${level}"` : ""}.`,
    );
  }

  const combos: { technique: SqliTechnique; obfuscation: SqliObfuscation }[] = [];
  for (const technique of techniquePool) {
    const obfuscationPool = fixedObfuscation ? [fixedObfuscation] : eligibleObfuscations(level, technique, maintainLevel, dialect, infoExpr);
    for (const obfuscation of obfuscationPool.length > 0 ? obfuscationPool : [NONE_SQLI_OBFUSCATION]) {
      combos.push({ technique, obfuscation });
    }
  }

  if (blacklist.size > 0) {
    const clean = combos.filter(
      ({ technique, obfuscation }) =>
        buildAdaptedPayload(technique, obfuscation, dialect, infoExpr, context, columnCount, blacklist).violations.length === 0,
    );
    if (clean.length > 0) return clean[Math.floor(Math.random() * clean.length)];
  }
  return combos[Math.floor(Math.random() * combos.length)];
}

export function buildPayload(
  technique: SqliTechnique,
  obfuscation: SqliObfuscation,
  dialect: SqlDialect,
  infoExpr: string | null,
  context: SqliContext,
  columnCount: number,
  blacklist: ReadonlySet<string>,
): AdaptedSqliPayload {
  return buildAdaptedPayload(technique, obfuscation, dialect, infoExpr, context, columnCount, blacklist);
}

export { LEVEL_ORDER };
