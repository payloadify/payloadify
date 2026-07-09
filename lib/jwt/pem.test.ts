// @vitest-environment node
import { describe, expect, it } from "vitest";
import { derToPem, pemToDer } from "./pem";

describe("derToPem / pemToDer", () => {
  it("round-trips arbitrary DER bytes through PEM encoding", async () => {
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
      { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["sign", "verify"],
    );
    const publicDer = await crypto.subtle.exportKey("spki", publicKey);
    const privateDer = await crypto.subtle.exportKey("pkcs8", privateKey);

    const publicPem = derToPem("PUBLIC KEY", publicDer);
    const privatePem = derToPem("PRIVATE KEY", privateDer);

    expect(publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----\n[\s\S]+\n-----END PUBLIC KEY-----$/);
    expect(privatePem).toMatch(/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/);

    const { label: pubLabel, der: pubDerBack } = pemToDer(publicPem);
    const { label: privLabel, der: privDerBack } = pemToDer(privatePem);
    expect(pubLabel).toBe("PUBLIC KEY");
    expect(privLabel).toBe("PRIVATE KEY");
    expect(new Uint8Array(pubDerBack)).toEqual(new Uint8Array(publicDer));
    expect(new Uint8Array(privDerBack)).toEqual(new Uint8Array(privateDer));

    // The round-tripped DER must actually re-import successfully.
    await expect(
      crypto.subtle.importKey("spki", pubDerBack, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["verify"]),
    ).resolves.toBeDefined();
  });

  it("wraps long base64 at 64 characters per line", () => {
    const der = new Uint8Array(200).fill(65).buffer;
    const pem = derToPem("PUBLIC KEY", der);
    const bodyLines = pem.split("\n").slice(1, -1);
    for (const line of bodyLines.slice(0, -1)) {
      expect(line.length).toBe(64);
    }
  });

  it("rejects input missing BEGIN/END markers", () => {
    expect(() => pemToDer("not a pem at all")).toThrow(/BEGIN\/END/);
  });

  it("rejects PKCS#1 RSA private keys with an actionable error", () => {
    const fakePkcs1 = "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAK==\n-----END RSA PRIVATE KEY-----";
    expect(() => pemToDer(fakePkcs1)).toThrow(/PKCS#1\/SEC1/);
  });

  it("rejects SEC1 EC private keys with an actionable error", () => {
    const fakeSec1 = "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIA==\n-----END EC PRIVATE KEY-----";
    expect(() => pemToDer(fakeSec1)).toThrow(/PKCS#1\/SEC1/);
  });

  it("rejects unrecognized PEM block labels", () => {
    const fake = "-----BEGIN CERTIFICATE-----\nMIIBOgIBAAJBAK==\n-----END CERTIFICATE-----";
    expect(() => pemToDer(fake)).toThrow(/Unrecognized PEM block/);
  });
});
