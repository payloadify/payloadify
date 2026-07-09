export type JoseAlg =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "none";

export type AlgFamily = "hmac" | "rsa" | "ec" | "rsa-pss" | "none";

export type HashName = "SHA-256" | "SHA-384" | "SHA-512";
export type EcCurve = "P-256" | "P-384" | "P-521";

export interface AlgSpec {
  alg: JoseAlg;
  family: AlgFamily;
  label: string;
  /** Hash used for signing (HMAC/RSA/EC/RSA-PSS). Absent for "none". */
  hash?: HashName;
  /** EC only. */
  namedCurve?: EcCurve;
  /** RSA-PSS only, in bytes — per RFC 7518 §3.5, equal to the hash output length. */
  pssSaltLength?: number;
}

export const ALGORITHMS: Record<JoseAlg, AlgSpec> = {
  HS256: { alg: "HS256", family: "hmac", label: "HS256 (HMAC-SHA256)", hash: "SHA-256" },
  HS384: { alg: "HS384", family: "hmac", label: "HS384 (HMAC-SHA384)", hash: "SHA-384" },
  HS512: { alg: "HS512", family: "hmac", label: "HS512 (HMAC-SHA512)", hash: "SHA-512" },
  RS256: { alg: "RS256", family: "rsa", label: "RS256 (RSASSA-PKCS1-v1_5 SHA-256)", hash: "SHA-256" },
  RS384: { alg: "RS384", family: "rsa", label: "RS384 (RSASSA-PKCS1-v1_5 SHA-384)", hash: "SHA-384" },
  RS512: { alg: "RS512", family: "rsa", label: "RS512 (RSASSA-PKCS1-v1_5 SHA-512)", hash: "SHA-512" },
  ES256: { alg: "ES256", family: "ec", label: "ES256 (ECDSA P-256)", hash: "SHA-256", namedCurve: "P-256" },
  ES384: { alg: "ES384", family: "ec", label: "ES384 (ECDSA P-384)", hash: "SHA-384", namedCurve: "P-384" },
  ES512: { alg: "ES512", family: "ec", label: "ES512 (ECDSA P-521)", hash: "SHA-512", namedCurve: "P-521" },
  PS256: { alg: "PS256", family: "rsa-pss", label: "PS256 (RSASSA-PSS SHA-256)", hash: "SHA-256", pssSaltLength: 32 },
  PS384: { alg: "PS384", family: "rsa-pss", label: "PS384 (RSASSA-PSS SHA-384)", hash: "SHA-384", pssSaltLength: 48 },
  PS512: { alg: "PS512", family: "rsa-pss", label: "PS512 (RSASSA-PSS SHA-512)", hash: "SHA-512", pssSaltLength: 64 },
  none: { alg: "none", family: "none", label: "none (unsigned — testing only)" },
};

export const ALGORITHM_GROUPS: { family: AlgFamily; label: string; algs: JoseAlg[] }[] = [
  { family: "hmac", label: "HMAC (symmetric secret)", algs: ["HS256", "HS384", "HS512"] },
  { family: "rsa", label: "RSA (RSASSA-PKCS1-v1_5)", algs: ["RS256", "RS384", "RS512"] },
  { family: "ec", label: "ECDSA", algs: ["ES256", "ES384", "ES512"] },
  { family: "rsa-pss", label: "RSA-PSS", algs: ["PS256", "PS384", "PS512"] },
  { family: "none", label: "Unsigned (testing only)", algs: ["none"] },
];

export function isAsymmetricFamily(family: AlgFamily): family is "rsa" | "ec" | "rsa-pss" {
  return family === "rsa" || family === "ec" || family === "rsa-pss";
}
