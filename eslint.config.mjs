import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Compiled output of workspace packages (e.g. @payloadify/cvss-core) — generated JS, not source.
    "packages/*/dist/**",
    // Cloudflare Worker source — separate runtime/tsconfig (Workers types, no DOM lib), not part of
    // the Next.js app. Type-checked via its own `npm run types:worker` script instead.
    "worker/**",
  ]),
]);

export default eslintConfig;
