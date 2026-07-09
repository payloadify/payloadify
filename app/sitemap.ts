import { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const BASE_URL = "https://payloadify.dev";
const APP_DIR = path.join(process.cwd(), "app");
const PAGE_FILE_PATTERN = /^page\.(tsx|ts|jsx|js)$/;

// A page opts out of the sitemap by setting `robots: { index: false }` in
// its exported metadata (used by client-redirect stub pages).
function isIndexable(pageFilePath: string): boolean {
  const source = fs.readFileSync(pageFilePath, "utf-8");
  return !/index:\s*false/.test(source);
}

function findRoutes(dir: string, segments: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes: string[] = [];

  const pageFile = entries.find(
    (entry) => entry.isFile() && PAGE_FILE_PATTERN.test(entry.name),
  );
  if (pageFile && isIndexable(path.join(dir, pageFile.name))) {
    routes.push(segments.length ? `/${segments.join("/")}` : "/");
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    // Skip route groups "(group)" and dynamic segments "[slug]" — this
    // site has none today, but neither belongs in a static sitemap.
    if (entry.name.startsWith("(") || entry.name.startsWith("[")) continue;
    routes.push(...findRoutes(path.join(dir, entry.name), [...segments, entry.name]));
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = findRoutes(APP_DIR).sort();
  return routes.map((route) => ({ url: `${BASE_URL}${route}` }));
}
