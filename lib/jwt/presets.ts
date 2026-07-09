import { JoseAlg } from "./algorithms";

export interface JwtPreset {
  id: string;
  label: string;
  description: string;
  alg: JoseAlg;
  buildHeader: () => Record<string, unknown>;
  buildPayload: (nowEpochSeconds: number) => Record<string, unknown>;
}

const ONE_HOUR = 3600;
const TWO_HOURS = 7200;

export const JWT_PRESETS: JwtPreset[] = [
  {
    id: "standard-hs256",
    label: "Standard HS256 session token",
    description: "A typical short-lived session token signed with a shared HMAC secret.",
    alg: "HS256",
    buildHeader: () => ({ alg: "HS256", typ: "JWT" }),
    buildPayload: (now) => ({ sub: "user-1234", iss: "https://api.example.com", iat: now, exp: now + ONE_HOUR }),
  },
  {
    id: "rs256-kid",
    label: "RS256 token with kid header",
    description: "Asymmetric RS256 token with a key-id header, for testing multi-key JWKS setups.",
    alg: "RS256",
    buildHeader: () => ({ alg: "RS256", typ: "JWT", kid: "key-1" }),
    buildPayload: (now) => ({ sub: "user-1234", iat: now, exp: now + ONE_HOUR }),
  },
  {
    id: "alg-none",
    label: "Token with alg:none (unsigned)",
    description: 'Classic alg:none bypass test case — checks whether a target accepts an unsigned token.',
    alg: "none",
    buildHeader: () => ({ alg: "none", typ: "JWT" }),
    buildPayload: (now) => ({ sub: "admin", iat: now }),
  },
  {
    id: "expired",
    label: "Expired token",
    description: "exp set in the past — checks whether a target correctly rejects expired tokens.",
    alg: "HS256",
    buildHeader: () => ({ alg: "HS256", typ: "JWT" }),
    buildPayload: (now) => ({ sub: "user-1234", iat: now - TWO_HOURS, exp: now - ONE_HOUR }),
  },
  {
    id: "missing-exp",
    label: "Token missing exp",
    description: "No exp claim at all — checks whether a target enforces expiry by default.",
    alg: "HS256",
    buildHeader: () => ({ alg: "HS256", typ: "JWT" }),
    buildPayload: (now) => ({ sub: "user-1234", iat: now }),
  },
  {
    id: "aud-iss-api",
    label: "aud/iss set for a typical API",
    description: "Populated aud/iss claims, for testing audience/issuer validation.",
    alg: "HS256",
    buildHeader: () => ({ alg: "HS256", typ: "JWT" }),
    buildPayload: (now) => ({
      iss: "https://auth.example.com",
      aud: "https://api.example.com",
      sub: "user-1234",
      iat: now,
      exp: now + ONE_HOUR,
    }),
  },
];

export function getPreset(id: string): JwtPreset | undefined {
  return JWT_PRESETS.find((p) => p.id === id);
}
