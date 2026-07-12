// Runs after `next build` (static export), wired in as the npm "postbuild" step.
//
// Every page needs a strict Content-Security-Policy with NO 'unsafe-inline' on
// script-src. The problem: Next.js's App Router embeds the RSC hydration
// payload as inline <script> tags on every page — without them the tools
// render but never become interactive (clicking "Decode"/"Generate" does
// nothing). A bare `script-src 'self'` blocks those inline scripts outright.
//
// Fix: allowlist the exact inline scripts by SHA-256 hash instead of using
// 'unsafe-inline'. Only scripts whose content matches byte-for-byte — i.e.
// the ones Next.js itself generated at this build — are allowed to run. Any
// attacker-injected inline script has arbitrary content and will never match
// a precomputed hash.
//
// Cloudflare Pages merges headers from multiple matching _headers blocks by
// COMMA-JOINING them, and browsers enforce comma-joined CSP as an
// INTERSECTION of policies (all must be satisfied). That means the hash
// allowlist can only live in a page-specific block ("/jwt-decoder/" etc.) —
// never alongside a separate global Content-Security-Policy in "/*", or the
// global rule silently cancels the hashes out and every page's hydration
// breaks with zero build-time warning. Because of this, public/_headers
// intentionally carries NO Content-Security-Policy line — this script is the
// only thing that adds one, self-contained per page, appended below it.
//
// Any request path with no matching page-specific block (e.g. the Cloudflare
// Pages 404 fallback, which can be served for an arbitrary unmatched URL) get
// no CSP header at all rather than a broken one. That's a deliberate
// trade-off: no CSP on that one fallback route, instead of a build that can
// silently ship a broken policy.
//
// If anything here fails, it throws and `npm run build` exits non-zero —
// deploys always run this build, so a bad policy should never make it out.

import { createHash } from "node:crypto";
import { readFile, readdir, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const OUT_DIR = fileURLToPath(new URL("../out", import.meta.url));
const HEADERS_PATH = path.join(OUT_DIR, "_headers");
const MAX_LINE_LENGTH = 2000; // Cloudflare Pages _headers hard limit per line
const MAX_RULES = 100; // Cloudflare Pages hard limit on path-pattern blocks per file

// Files Cloudflare's "404-page" fallback serves for arbitrary unmatched URLs —
// a _headers block for their own literal path would never actually match
// real 404 traffic, so they're deliberately skipped.
const SKIP_ROUTES = new Set(["/404.html", "/404/", "/_not-found/"]);

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(fullPath);
      return entry.name.endsWith(".html") ? [fullPath] : [];
    })
  );
  return files.flat();
}

function toRoutePath(htmlFile) {
  const relative = path.relative(OUT_DIR, htmlFile).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return "/" + relative.slice(0, -"index.html".length);
  return "/" + relative; // e.g. a standalone file like 404.html
}

function extractInlineScriptHashes(html) {
  const hashes = new Set();
  const scriptTagPattern = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptTagPattern.exec(html)) !== null) {
    const content = match[1];
    if (!content) continue;
    const hash = createHash("sha256").update(content, "utf8").digest("base64");
    hashes.add(`'sha256-${hash}'`);
  }
  return hashes;
}

function buildCspLine(scriptHashes) {
  const scriptSrc = ["'self'", ...[...scriptHashes].sort()].join(" ");
  return (
    `Content-Security-Policy: default-src 'self'; script-src ${scriptSrc}; ` +
    `object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; ` +
    `connect-src 'self'; frame-ancestors 'none'`
  );
}

async function main() {
  const htmlFiles = await findHtmlFiles(OUT_DIR);
  if (htmlFiles.length === 0) {
    throw new Error("generate-csp-hashes: found no HTML files in out/ — did `next build` run first?");
  }

  const blocks = [];
  for (const file of htmlFiles) {
    const routePath = toRoutePath(file);
    if (SKIP_ROUTES.has(routePath)) continue;

    const html = await readFile(file, "utf8");
    const hashes = extractInlineScriptHashes(html);
    const cspLine = buildCspLine(hashes);

    if (cspLine.length > MAX_LINE_LENGTH) {
      throw new Error(
        `generate-csp-hashes: CSP line for ${routePath} is ${cspLine.length} chars, over Cloudflare's ${MAX_LINE_LENGTH}-char limit`
      );
    }

    blocks.push(`${routePath}\n  ${cspLine}\n`);
  }

  if (blocks.length > MAX_RULES) {
    throw new Error(
      `generate-csp-hashes: generated ${blocks.length} path rules, over Cloudflare's ${MAX_RULES}-rule limit per _headers file`
    );
  }

  await appendFile(HEADERS_PATH, "\n" + blocks.join("\n"));
  console.log(`generate-csp-hashes: wrote per-page CSP for ${blocks.length} route(s) to out/_headers`);
}

main();
