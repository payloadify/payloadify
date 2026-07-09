import { describe, expect, it } from "vitest";
import { computeGeneratorWeaknessFlags } from "./weaknessFlags";

const now = Math.floor(Date.now() / 1000);

describe("computeGeneratorWeaknessFlags", () => {
  it("flags alg:none", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "none", header: {}, payload: {} });
    expect(flags.some((f) => f.id === "alg-none" && f.variant === "danger")).toBe(true);
  });

  it("flags a PEM key pasted into the HMAC secret field", () => {
    const flags = computeGeneratorWeaknessFlags({
      alg: "HS256",
      header: {},
      payload: {},
      hmacSecret: "-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----",
    });
    expect(flags.some((f) => f.id === "secret-is-pem")).toBe(true);
  });

  it("flags a common weak secret", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "HS256", header: {}, payload: {}, hmacSecret: "secret" });
    expect(flags.some((f) => f.id === "secret-common-weak")).toBe(true);
  });

  it("flags a short secret that isn't on the common-weak list", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "HS256", header: {}, payload: {}, hmacSecret: "abc123" });
    expect(flags.some((f) => f.id === "secret-short")).toBe(true);
  });

  it("does not flag a long random-looking secret", () => {
    const flags = computeGeneratorWeaknessFlags({
      alg: "HS256",
      header: {},
      payload: {},
      hmacSecret: "Xk9mQ2pL7vN4rT8wY1zA3bC6dE0fG5hJ",
    });
    expect(flags.some((f) => f.id.startsWith("secret-"))).toBe(false);
  });

  it("does not apply HMAC secret checks to non-HS algorithms", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "RS256", header: {}, payload: {}, hmacSecret: "secret" });
    expect(flags.some((f) => f.id.startsWith("secret-"))).toBe(false);
  });

  it("flags a missing exp claim", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "HS256", header: {}, payload: { sub: "user-1" } });
    expect(flags.some((f) => f.id === "missing-exp")).toBe(true);
  });

  it("flags an expired exp claim instead of missing-exp when exp is present but past", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "HS256", header: {}, payload: { exp: now - 3600 } });
    expect(flags.some((f) => f.id === "exp-past")).toBe(true);
    expect(flags.some((f) => f.id === "missing-exp")).toBe(false);
  });

  it("flags a future nbf claim", () => {
    const flags = computeGeneratorWeaknessFlags({ alg: "HS256", header: {}, payload: { exp: now + 3600, nbf: now + 1800 } });
    expect(flags.some((f) => f.id === "nbf-future")).toBe(true);
  });

  it("returns no flags for a well-formed, unexpired, strongly-keyed token", () => {
    const flags = computeGeneratorWeaknessFlags({
      alg: "HS256",
      header: {},
      payload: { sub: "user-1", exp: now + 3600 },
      hmacSecret: "Xk9mQ2pL7vN4rT8wY1zA3bC6dE0fG5hJ",
    });
    expect(flags).toEqual([]);
  });
});
