// @vitest-environment node
import { describe, expect, it } from "vitest";
import * as jose from "jose";
import { signHmac, verifyHmac } from "./hmac";
import { decodeJwt } from "./jwt";
import { textToBase64url } from "./base64url";

const ALGS = ["HS256", "HS384", "HS512"] as const;

describe("signHmac", () => {
  for (const alg of ALGS) {
    it(`produces a ${alg} token that verifies with an independent library (jose)`, async () => {
      const header = textToBase64url(JSON.stringify({ alg, typ: "JWT" }));
      const payload = textToBase64url(JSON.stringify({ sub: "user-1", iat: 1700000000 }));
      const secret = "correct horse battery staple 1234567890";
      const signature = await signHmac(alg, header, payload, secret);
      const token = `${header}.${payload}.${signature}`;

      const { payload: verified } = await jose.jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: [alg],
      });
      expect(verified.sub).toBe("user-1");
    });

    it(`round-trips through verifyHmac for ${alg}`, async () => {
      const header = textToBase64url(JSON.stringify({ alg, typ: "JWT" }));
      const payload = textToBase64url(JSON.stringify({ sub: "user-1" }));
      const secret = "another-test-secret";
      const signature = await signHmac(alg, header, payload, secret);
      const token = `${header}.${payload}.${signature}`;
      const decoded = decodeJwt(token);
      if ("error" in decoded) throw new Error(decoded.error);

      expect(await verifyHmac(alg, decoded, secret)).toBe(true);
      expect(await verifyHmac(alg, decoded, "wrong-secret")).toBe(false);
    });
  }

  it("a token tampered after signing fails verification", async () => {
    const header = textToBase64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = textToBase64url(JSON.stringify({ sub: "user-1" }));
    const secret = "tamper-test-secret";
    const signature = await signHmac("HS256", header, payload, secret);
    const tamperedPayload = textToBase64url(JSON.stringify({ sub: "admin" }));
    const token = `${header}.${tamperedPayload}.${signature}`;

    await expect(
      jose.jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] }),
    ).rejects.toThrow();
  });
});
