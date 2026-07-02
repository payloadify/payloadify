import { XssContext, XssLevel, XssInjectionType, XssSlot, XSS_INJECTION_TYPES } from "./injectionTypes";
import { Obfuscation, OBFUSCATIONS, NONE_OBFUSCATION } from "./obfuscation";
import { buildAdaptedPayload, AdaptedPayload } from "./blacklist";

const LEVEL_ORDER: XssLevel[] = ["basic", "intermediate", "advanced"];
const LEVEL_RANK: Record<XssLevel, number> = { basic: 0, intermediate: 1, advanced: 2 };

/** The higher-ranked of the injection type's and obfuscation's own level — an advanced
 *  obfuscation on top of a basic injection type still counts as an advanced payload overall. */
export function effectiveLevel(injectionType: XssInjectionType, obfuscation: Obfuscation): XssLevel {
  return LEVEL_RANK[injectionType.level] >= LEVEL_RANK[obfuscation.level] ? injectionType.level : obfuscation.level;
}

/** Picks a random injection type matching the given context, honoring `level` only when
 *  `maintainLevel` is true — otherwise any level (basic through advanced) is eligible. */
export function pickInjectionType(level: XssLevel, context: XssContext, maintainLevel: boolean): XssInjectionType {
  const pool = XSS_INJECTION_TYPES.filter(
    (t) => t.contexts.includes(context) && (!maintainLevel || t.level === level),
  );
  if (pool.length === 0) {
    throw new Error(`No XSS injection types available for context "${context}"${maintainLevel ? ` at level "${level}"` : ""}.`);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Picks a random obfuscation compatible with the injection type's slot and (when
 *  `maintainLevel` is true) the given level. Falls back to "none" when nothing in the eligible
 *  pool actually applies to `actionExpr` (e.g. maintainLevel pinned to "intermediate" but the
 *  action isn't a name(args)-shaped call, so string-concat/backtick-call don't qualify). */
export function pickObfuscation(
  level: XssLevel,
  slot: XssSlot,
  maintainLevel: boolean,
  actionExpr: string,
): Obfuscation {
  const pool = OBFUSCATIONS.filter(
    (o) => o.slots.includes(slot) && (!maintainLevel || o.level === level) && o.apply(actionExpr, '"') !== null,
  );
  if (pool.length === 0) return NONE_OBFUSCATION;
  return pool[Math.floor(Math.random() * pool.length)];
}

function eligibleObfuscations(
  level: XssLevel,
  slot: XssSlot,
  maintainLevel: boolean,
  actionExpr: string,
): Obfuscation[] {
  return OBFUSCATIONS.filter(
    (o) => o.slots.includes(slot) && (!maintainLevel || o.level === level) && o.apply(actionExpr, '"') !== null,
  );
}

/** Randomly picks an injection type and/or obfuscation (honoring any `fixedInjection`/
 *  `fixedObfuscation` pinned by the user), preferring a combination that fully avoids the
 *  blacklist when one exists among the eligible pool. Falls back to any eligible combination
 *  when none can avoid the blacklist, so the UI still gets a payload (with violations reported)
 *  rather than nothing at all. */
export function pickInjectionAndObfuscation(
  level: XssLevel,
  context: XssContext,
  maintainLevel: boolean,
  actionExpr: string,
  blacklist: ReadonlySet<string>,
  fixedInjection?: XssInjectionType,
  fixedObfuscation?: Obfuscation,
): { injection: XssInjectionType; obfuscation: Obfuscation } {
  const injectionPool = fixedInjection
    ? [fixedInjection]
    : XSS_INJECTION_TYPES.filter((t) => t.contexts.includes(context) && (!maintainLevel || t.level === level));
  if (injectionPool.length === 0) {
    throw new Error(`No XSS injection types available for context "${context}"${maintainLevel ? ` at level "${level}"` : ""}.`);
  }

  const combos: { injection: XssInjectionType; obfuscation: Obfuscation }[] = [];
  for (const injection of injectionPool) {
    const obfuscationPool = fixedObfuscation
      ? [fixedObfuscation]
      : eligibleObfuscations(level, injection.slot, maintainLevel, actionExpr);
    for (const obfuscation of obfuscationPool.length > 0 ? obfuscationPool : [NONE_OBFUSCATION]) {
      combos.push({ injection, obfuscation });
    }
  }

  if (blacklist.size > 0) {
    const clean = combos.filter(
      ({ injection, obfuscation }) =>
        buildAdaptedPayload(injection, obfuscation, actionExpr, blacklist).violations.length === 0,
    );
    if (clean.length > 0) return clean[Math.floor(Math.random() * clean.length)];
  }
  return combos[Math.floor(Math.random() * combos.length)];
}

export function buildPayload(
  injectionType: XssInjectionType,
  obfuscation: Obfuscation,
  actionExpr: string,
  blacklist: ReadonlySet<string>,
): AdaptedPayload {
  return buildAdaptedPayload(injectionType, obfuscation, actionExpr, blacklist);
}

export { LEVEL_ORDER };
