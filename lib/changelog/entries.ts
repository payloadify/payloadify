export type ChangelogCategory = "Added" | "Improved" | "Fixed";

export interface ChangelogItem {
  category: ChangelogCategory;
  text: string;
}

export interface ChangelogEntry {
  date: string; // ISO "YYYY-MM-DD" — also used for the unseen-entry comparison (lexical = chronological)
  title?: string; // optional heading override for milestone entries
  items: ChangelogItem[];
}

// Newest first. To ship a new entry, add a new object at the TOP of this array.
export const changelogEntries: ChangelogEntry[] = [
  {
    date: "2026-07-12",
    items: [
      {
        category: "Added",
        text: "Changelog — see what's new on Payloadify, grouped by date and category, from the header",
      },
      { category: "Improved", text: "Widened the site's content area for a better fit on larger screens" },
      {
        category: "Improved",
        text: "Hardened site security headers (Content-Security-Policy) and patched a dependency vulnerability flagged by Dependabot",
      },
    ],
  },
  {
    date: "2026-07-09",
    items: [
      {
        category: "Added",
        text: "JWT Generator tool — standard and enhanced secret keys, selectable 128–512-bit strength, secret masking, step-by-step walkthrough guide, \"copy all\" panel, and reference links",
      },
      { category: "Added", text: "sitemap.xml and robots.txt for search engines" },
    ],
  },
  {
    date: "2026-07-07",
    items: [
      {
        category: "Added",
        text: "Security policy published (SECURITY.md), plus security info added to the footer and privacy policy",
      },
      { category: "Added", text: "Import/export for saved CVSS templates" },
      {
        category: "Fixed",
        text: "Hardened CVSS template import validation — a corrupted or hand-edited import file could previously produce an incorrect (falsely \"Critical\") severity score instead of being rejected",
      },
      {
        category: "Fixed",
        text: "Re-saving a CVSS template under an existing name now correctly overwrites it instead of creating a duplicate",
      },
      { category: "Fixed", text: "Collapsible text areas in the CVSS calculator" },
    ],
  },
  {
    date: "2026-07-05",
    items: [
      { category: "Added", text: "CVSS 3.1 / 4.0 Calculator, with templates and saved settings" },
      { category: "Improved", text: "Homepage reorganized into tool categories" },
      { category: "Fixed", text: "CVSS autofill issues; corrected stale scoring-matrix comments" },
      { category: "Improved", text: "OWASP/VRT dropdowns grouped into categories, with explanatory tooltips" },
    ],
  },
  {
    date: "2026-07-03",
    title: "Payloadify launches",
    items: [
      {
        category: "Added",
        text: "Reverse Shell Generator tool (multiple languages, encoders, input validation, download option)",
      },
      { category: "Added", text: "MSFVenom Command Generator tool" },
      { category: "Fixed", text: "Iterations field bug in the MSFVenom generator" },
      { category: "Improved", text: "Privacy policy updated" },
    ],
  },
  {
    date: "2026-07-02",
    items: [
      { category: "Added", text: "SQLi Payload Generator tool" },
      { category: "Added", text: "XSS Payload Generator tool" },
      { category: "Added", text: "Homoglyph Identifier/Generator tool" },
      { category: "Added", text: "Payload Encoder/Decoder tool" },
      { category: "Added", text: "Privacy Policy page" },
      { category: "Fixed", text: "Hash Identifier detection/signature fixes" },
      { category: "Fixed", text: "JWT Decoder signature panel fix" },
      {
        category: "Improved",
        text: "XSS generator — removed an unsafe \"cookie-exfil\" action, improved context-selection logic",
      },
    ],
  },
  {
    date: "2026-07-01",
    title: "Payloadify in development",
    items: [{ category: "Added", text: "Early build of the JWT Decoder and Hash Identifier tools" }],
  },
];

export function getLatestChangelogDate(): string {
  return changelogEntries[0].date;
}
