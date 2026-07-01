// Small, well-known list of default/example HMAC secrets seen in the wild
// (framework docs, tutorials, jwt.io's own default). Not a brute-force list —
// just enough to catch the most common real-world misconfigurations.
export const COMMON_WEAK_SECRETS: string[] = [
  "your-256-bit-secret",
  "secret",
  "your-secret-key",
  "changeme",
  "password",
  "123456",
  "test",
  "jwtsecret",
  "supersecret",
  "mysecretkey",
  "qwerty",
  "admin",
  "key",
];
