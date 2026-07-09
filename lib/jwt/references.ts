export interface JwtReference {
  id: string;
  label: string;
  url: string;
  source: string;
}

/** URLs verified to resolve to on-topic content as of this build (see PR notes) — re-check
 *  periodically since external sites can restructure. */
export const JWT_REFERENCES: JwtReference[] = [
  {
    id: "portswigger-jwt-attacks",
    label: "JWT attacks",
    url: "https://portswigger.net/web-security/jwt",
    source: "PortSwigger Web Security Academy",
  },
  {
    id: "portswigger-alg-confusion",
    label: "Algorithm confusion attacks",
    url: "https://portswigger.net/web-security/jwt/algorithm-confusion",
    source: "PortSwigger Web Security Academy",
  },
  {
    id: "owasp-jwt-cheatsheet",
    label: "JSON Web Token Cheat Sheet",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html",
    source: "OWASP Cheat Sheet Series",
  },
  {
    id: "rfc-7519",
    label: "RFC 7519 — JSON Web Token (JWT)",
    url: "https://datatracker.ietf.org/doc/html/rfc7519",
    source: "IETF",
  },
  {
    id: "rfc-8725",
    label: "RFC 8725 — JWT Best Current Practices",
    url: "https://www.rfc-editor.org/rfc/rfc8725.html",
    source: "IETF",
  },
  {
    id: "jwtio-debugger",
    label: "JWT.io Debugger",
    url: "https://jwt.io",
    source: "jwt.io",
  },
  {
    id: "jwtio-introduction",
    label: "Introduction to JSON Web Tokens",
    url: "https://www.jwt.io/introduction",
    source: "jwt.io",
  },
];
