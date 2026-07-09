// @vitest-environment node
import { describe, expect, it } from "vitest";
import * as jose from "jose";
import {
  exportKeyPairPem,
  generateAsymmetricKeyPair,
  importPrivateKeyPem,
  importPublicKeyPem,
  signAsymmetric,
  verifyAsymmetric,
} from "./asymmetric";
import { decodeJwt } from "./jwt";
import { textToBase64url, base64urlToBytes } from "./base64url";
import { JoseAlg } from "./algorithms";

const ALGS: JoseAlg[] = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "PS256", "PS384", "PS512"];

describe("generateAsymmetricKeyPair / signAsymmetric", () => {
  for (const alg of ALGS) {
    it(`produces a ${alg} token that verifies with an independent library (jose), via exported PEM`, async () => {
      const keyPair = await generateAsymmetricKeyPair(alg);
      const { publicPem, privatePem } = await exportKeyPairPem(keyPair);

      const header = textToBase64url(JSON.stringify({ alg, typ: "JWT" }));
      const payload = textToBase64url(JSON.stringify({ sub: "user-1", iat: 1700000000 }));
      const signature = await signAsymmetric(alg, header, payload, keyPair.privateKey);
      const token = `${header}.${payload}.${signature}`;

      // Independent round-trip: re-import the PEM this tool exported (not the original
      // in-memory CryptoKey) through `jose`, proving the PEM encoding itself is correct.
      const joseAlg = alg;
      const publicKey = await jose.importSPKI(publicPem, joseAlg);
      const { payload: verified } = await jose.jwtVerify(token, publicKey, { algorithms: [joseAlg] });
      expect(verified.sub).toBe("user-1");

      // Sanity-check the private PEM is also importable (round-trip, not used for signing here).
      const reimportedPrivate = await jose.importPKCS8(privatePem, joseAlg);
      expect(reimportedPrivate).toBeDefined();
    });

    it(`${alg}: a tampered payload fails verification`, async () => {
      const keyPair = await generateAsymmetricKeyPair(alg);
      const { publicPem } = await exportKeyPairPem(keyPair);
      const header = textToBase64url(JSON.stringify({ alg, typ: "JWT" }));
      const payload = textToBase64url(JSON.stringify({ sub: "user-1" }));
      const signature = await signAsymmetric(alg, header, payload, keyPair.privateKey);
      const tamperedPayload = textToBase64url(JSON.stringify({ sub: "admin" }));
      const token = `${header}.${tamperedPayload}.${signature}`;

      const publicKey = await jose.importSPKI(publicPem, alg);
      await expect(jose.jwtVerify(token, publicKey, { algorithms: [alg] })).rejects.toThrow();
    });

    it(`${alg}: verifyAsymmetric agrees with jose (positive and negative)`, async () => {
      const keyPair = await generateAsymmetricKeyPair(alg);
      const otherKeyPair = await generateAsymmetricKeyPair(alg);
      const header = textToBase64url(JSON.stringify({ alg, typ: "JWT" }));
      const payload = textToBase64url(JSON.stringify({ sub: "user-1" }));
      const signature = await signAsymmetric(alg, header, payload, keyPair.privateKey);
      const token = `${header}.${payload}.${signature}`;
      const decoded = decodeJwt(token);
      if ("error" in decoded) throw new Error(decoded.error);

      expect(await verifyAsymmetric(alg, decoded, keyPair.publicKey)).toBe(true);
      expect(await verifyAsymmetric(alg, decoded, otherKeyPair.publicKey)).toBe(false);
    });
  }

  it("importPrivateKeyPem / importPublicKeyPem round-trip and can sign/verify", async () => {
    const keyPair = await generateAsymmetricKeyPair("RS256");
    const { publicPem, privatePem } = await exportKeyPairPem(keyPair);

    const reimportedPrivate = await importPrivateKeyPem(privatePem, "RS256");
    const reimportedPublic = await importPublicKeyPem(publicPem, "RS256");

    const header = textToBase64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = textToBase64url(JSON.stringify({ sub: "user-1" }));
    const signature = await signAsymmetric("RS256", header, payload, reimportedPrivate);
    const token = `${header}.${payload}.${signature}`;
    const decoded = decodeJwt(token);
    if ("error" in decoded) throw new Error(decoded.error);

    expect(await verifyAsymmetric("RS256", decoded, reimportedPublic)).toBe(true);
  });

  it("importPrivateKeyPem rejects a PUBLIC KEY PEM block", async () => {
    const keyPair = await generateAsymmetricKeyPair("RS256");
    const { publicPem } = await exportKeyPairPem(keyPair);
    await expect(importPrivateKeyPem(publicPem, "RS256")).rejects.toThrow(/Expected a "PRIVATE KEY"/);
  });

  it("expected raw ECDSA signature lengths match P-256/P-384/P-521 r||s concatenation", async () => {
    const cases: [JoseAlg, number][] = [
      ["ES256", 64],
      ["ES384", 96],
      ["ES512", 132],
    ];
    for (const [alg, expectedBytes] of cases) {
      const keyPair = await generateAsymmetricKeyPair(alg);
      const header = textToBase64url(JSON.stringify({ alg, typ: "JWT" }));
      const payload = textToBase64url(JSON.stringify({ sub: "user-1" }));
      const signature = await signAsymmetric(alg, header, payload, keyPair.privateKey);
      expect(base64urlToBytes(signature).length).toBe(expectedBytes);
    }
  });
});
