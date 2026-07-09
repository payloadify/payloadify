import { parseJsonObject, stripToAlgNone } from "./jwt";
import { textToBase64url } from "./base64url";
import { signHmac } from "./hmac";
import { signAsymmetric } from "./asymmetric";
import { ALGORITHMS, JoseAlg } from "./algorithms";

/** Single dispatch point for building+signing a token — UI code calls this and never
 *  touches crypto.subtle directly. Mirrors jwt.ts's reSignHS256/stripToAlgNone signature
 *  shape (JSON text in, token out) so it composes naturally with the JsonEditor components. */

export type SigningKeyMaterial =
  | { kind: "hmac"; secret: string }
  | { kind: "asymmetric"; privateKey: CryptoKey }
  | { kind: "none" };

export async function buildAndSignToken(
  headerJson: string,
  payloadJson: string,
  alg: JoseAlg,
  key: SigningKeyMaterial,
): Promise<string> {
  if (alg === "none") {
    return stripToAlgNone(headerJson, payloadJson);
  }

  const headerObj = parseJsonObject(headerJson, "Header");
  const payloadObj = parseJsonObject(payloadJson, "Payload");
  const headerB64 = textToBase64url(JSON.stringify(headerObj));
  const payloadB64 = textToBase64url(JSON.stringify(payloadObj));

  const spec = ALGORITHMS[alg];
  if (spec.family === "hmac") {
    if (key.kind !== "hmac") throw new Error(`${alg} requires an HMAC secret`);
    const signature = await signHmac(alg as "HS256" | "HS384" | "HS512", headerB64, payloadB64, key.secret);
    return `${headerB64}.${payloadB64}.${signature}`;
  }

  if (key.kind !== "asymmetric") throw new Error(`${alg} requires a private key (paste a PEM or generate a keypair)`);
  const signature = await signAsymmetric(alg, headerB64, payloadB64, key.privateKey);
  return `${headerB64}.${payloadB64}.${signature}`;
}
