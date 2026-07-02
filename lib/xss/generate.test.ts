import { describe, expect, it } from "vitest";
import { buildPayload, effectiveLevel, pickInjectionAndObfuscation, pickInjectionType, pickObfuscation } from "./generate";
import { unavoidableChars } from "./blacklist";
import { XSS_INJECTION_TYPES } from "./injectionTypes";
import { NONE_OBFUSCATION, OBFUSCATIONS, OBFUSCATIONS_BY_ID } from "./obfuscation";

describe("pickInjectionType", () => {
  it("only returns injection types matching the given context", () => {
    for (let i = 0; i < 50; i++) {
      const type = pickInjectionType("basic", "dom", false);
      expect(type.contexts).toContain("dom");
    }
  });

  it("only returns injection types at the given level when maintainLevel is true", () => {
    for (let i = 0; i < 50; i++) {
      const type = pickInjectionType("advanced", "reflected-stored", true);
      expect(type.level).toBe("advanced");
      expect(type.contexts).toContain("reflected-stored");
    }
  });

  it("can return injection types of any level when maintainLevel is false", () => {
    const levelsSeen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      levelsSeen.add(pickInjectionType("basic", "reflected-stored", false).level);
    }
    expect(levelsSeen.size).toBeGreaterThan(1);
  });

  it("has coverage for every level/context pair the UI relies on", () => {
    expect(() => pickInjectionType("basic", "dom", true)).not.toThrow();
    for (const level of ["basic", "intermediate", "advanced"] as const) {
      for (const context of ["reflected-stored", "dom"] as const) {
        expect(
          XSS_INJECTION_TYPES.some((t) => t.level === level && t.contexts.includes(context)),
        ).toBe(true);
      }
    }
  });
});

describe("pickObfuscation", () => {
  it("only returns obfuscations valid for the given slot", () => {
    for (let i = 0; i < 50; i++) {
      const o = pickObfuscation("advanced", "attribute", false, "alert(1)");
      expect(o.slots).toContain("attribute");
    }
  });

  it("falls back to none when nothing in the maintainLevel-pinned pool applies", () => {
    // "custom document text" isn't a name(args)-shaped call, so string-concat/backtick-call
    // (the only "intermediate" obfuscations) don't apply — should fall back to none rather
    // than throw or return an obfuscation that would silently no-op mid-payload.
    const o = pickObfuscation("intermediate", "script", true, "custom document text");
    expect(o.id).toBe("none");
  });
});

describe("pickInjectionAndObfuscation", () => {
  it("prefers a combination that fully avoids the blacklist over one that reports violations", () => {
    // At the basic level, reflected-stored, blacklisting "<" used to leave every eligible
    // injection type in violation (they all built a new tag) — now basic-attr-breakout-javascript-uri
    // covers that gap, so a clean combo should always be found.
    for (let i = 0; i < 50; i++) {
      const { injection, obfuscation } = pickInjectionAndObfuscation(
        "basic",
        "reflected-stored",
        true,
        "alert(1)",
        new Set(["<"]),
      );
      const result = buildPayload(injection, obfuscation, "alert(1)", new Set(["<"]));
      expect(result.violations).toEqual([]);
    }
  });

  it("honors a fixed injection type while still randomizing obfuscation", () => {
    const fixed = XSS_INJECTION_TYPES.find((t) => t.id === "basic-img-onerror")!;
    for (let i = 0; i < 20; i++) {
      const { injection } = pickInjectionAndObfuscation(
        "basic",
        "reflected-stored",
        false,
        "alert(1)",
        new Set(),
        fixed,
      );
      expect(injection.id).toBe("basic-img-onerror");
    }
  });

  it("falls back to some combination when nothing can avoid the blacklist", () => {
    const { injection, obfuscation } = pickInjectionAndObfuscation(
      "basic",
      "dom",
      true,
      "alert(1)",
      new Set(["<", ">", '"', "'", "(", ")", "/", "\\", " ", ";", "="]),
    );
    expect(injection).toBeDefined();
    expect(obfuscation).toBeDefined();
  });
});

describe("unavoidableChars", () => {
  it("flags parens as unavoidable for eval-based obfuscations", () => {
    const result = unavoidableChars(OBFUSCATIONS_BY_ID["base64"], "alert(1)");
    expect(result.has("(")).toBe(true);
    expect(result.has(")")).toBe(true);
  });

  it("does not flag parens for backtick-call, which removes them entirely", () => {
    const result = unavoidableChars(OBFUSCATIONS_BY_ID["backtick-call"], "alert(1)");
    expect(result.has("(")).toBe(false);
    expect(result.has(")")).toBe(false);
  });

  it("does not flag quote characters, since either quote can be picked to dodge one", () => {
    const result = unavoidableChars(OBFUSCATIONS_BY_ID["base64"], "alert(1)");
    expect(result.has('"')).toBe(false);
    expect(result.has("'")).toBe(false);
  });
});

describe("effectiveLevel", () => {
  it("takes the higher-ranked of injection type and obfuscation level", () => {
    const basicInjection = XSS_INJECTION_TYPES.find((t) => t.id === "basic-script-tag")!;
    const advancedObfuscation = OBFUSCATIONS_BY_ID["base64"];
    expect(effectiveLevel(basicInjection, advancedObfuscation)).toBe("advanced");
    expect(effectiveLevel(basicInjection, NONE_OBFUSCATION)).toBe("basic");
  });
});

describe("buildPayload", () => {
  it("substitutes the action expression into the injection type with no obfuscation", () => {
    const type = XSS_INJECTION_TYPES.find((t) => t.id === "basic-img-onerror")!;
    const result = buildPayload(type, NONE_OBFUSCATION, "alert(1)", new Set());
    expect(result.payload).toBe(`<img src=x onerror="alert(1)">`);
    expect(result.violations).toEqual([]);
  });

  it("adapts quote style to avoid a blacklisted double quote", () => {
    const type = XSS_INJECTION_TYPES.find((t) => t.id === "basic-img-onerror")!;
    const result = buildPayload(type, NONE_OBFUSCATION, "alert(1)", new Set(['"']));
    expect(result.payload).toBe(`<img src=x onerror='alert(1)'>`);
    expect(result.violations).toEqual([]);
  });

  it("reports remaining violations when no combination fully avoids the blacklist", () => {
    const type = XSS_INJECTION_TYPES.find((t) => t.id === "basic-img-onerror")!;
    const result = buildPayload(type, NONE_OBFUSCATION, "alert(1)", new Set(["<"]));
    expect(result.violations).toEqual(["<"]);
  });

  it("falls back to the unobfuscated action when the obfuscation doesn't apply", () => {
    const type = XSS_INJECTION_TYPES.find((t) => t.id === "basic-script-tag")!;
    const stringConcat = OBFUSCATIONS_BY_ID["string-concat"];
    const result = buildPayload(type, stringConcat, "not a call expression", new Set());
    expect(result.obfuscationApplied).toBe(false);
    expect(result.payload).toBe(`<script>not a call expression</script>`);
  });

  it("every obfuscation applies to a plain name(args) call", () => {
    for (const o of OBFUSCATIONS) {
      const applied = o.apply("alert(1)", '"');
      expect(applied).not.toBeNull();
    }
  });
});
