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
    date: "2026-07-22",
    items: [
      {
        category: "Added",
        text: "Site-wide dark/light theme toggle in the header (shown as \"D\"/\"L\"), with a warm, non-pure-white light theme to match the site's non-pure-black dark theme",
      },
      {
        category: "Added",
        text: "CVSS Calculator: \"Import from report\" in the saved-templates panel, paste a report's text and extract a title, description, impact, and scores into a new saved template",
      },
      {
        category: "Added",
        text: "CVSS Calculator: saved-template capacity raised from 50 to 100, with a warning shown once you reach 80 saved templates, pointing at the existing Export button as a backup path",
      },
      {
        category: "Added",
        text: "CVSS Calculator: findings now show a vulnerability title, which updates automatically when scores are chained",
      },
      {
        category: "Added",
        text: "CVSS Calculator: Copy All output can now include an optional suffix, with a toggle to turn it off",
      },
      {
        category: "Improved",
        text: "CVSS Calculator: OWASP Category, VRT Category, and CWE fields in Additional Info are now searchable dropdowns instead of long unfiltered lists",
      },
      {
        category: "Improved",
        text: "CVSS Calculator: import-from-report detection logic is more comprehensive, and the \"Import from report\" button now sits beside \"Import from template\" for easier access",
      },
      {
        category: "Improved",
        text: "CVSS Calculator: \"Save this score as\" now auto-fills a meaningful name from the report-import title, selected template name, or current preset label when available, instead of requiring manual entry",
      },
      {
        category: "Improved",
        text: "CVSS Calculator: the Additional Settings section in Copy All is now more visually distinct, with its own color and hover effect",
      },
    ],
  },
  {
    date: "2026-07-20",
    items: [
      {
        category: "Added",
        text: "CVSS Calculator: AI/LLM platform option, with 10 scenario templates covering the OWASP Top 10 for LLM Applications (2025), including prompt injection, sensitive information disclosure, and system prompt leakage",
      },
      {
        category: "Added",
        text: "CVSS Calculator: Race Condition (TOCTOU) and Using Components with Known Vulnerabilities vuln types, each with web, API, and (for components) desktop scenario templates",
      },
      {
        category: "Improved",
        text: "CVSS Calculator: CWE dropdown expanded from 23 to 57 entries, grouped into 12 categories, with the broad parent CWE flagged and listed first in each group",
      },
      {
        category: "Improved",
        text: "CVSS Calculator: VRT dropdown now covers Bugcrowd's full published taxonomy (about 440 entries) instead of a small hand-picked list, with the taxonomy version shown in the copied output",
      },
      {
        category: "Fixed",
        text: "CVSS Calculator: rationale/notes text wasn't being included in the Copy All panel output",
      },
      {
        category: "Fixed",
        text: "CVSS Calculator: VRT autofill for two of the new LLM categories (Supply Chain, System Prompt Leakage) pointed at the wrong or a missing OWASP/CWE suggestion",
      },
    ],
  },
  {
    date: "2026-07-17",
    items: [
      {
        category: "Added",
        text: "Hashcat Command Builder tool: pick a mode and attack type (dictionary, mask, hybrid, combination), fill in wordlists/mask/rules and advanced flags, and get a copy-ready hashcat command, complete with companion --show and benchmark commands",
      },
      {
        category: "Improved",
        text: "Hash Identifier: expanded the signature database from 28 to 49 hash types, including Kerberoasting/AS-REP Roasting, NetNTLMv1/v2, WPA, Office/PDF/ZIP/RAR/7z/KeePass, and common web-app KDFs",
      },
      {
        category: "Added",
        text: "Hash Identifier: optional \"where did this hash come from?\" source selector, to reorder same-length ambiguous candidates (e.g. promote NTLM over MD5 for Windows dumps) without overstating confidence",
      },
      {
        category: "Improved",
        text: "\"Build Hashcat Command\" link on the Hash Identifier's results now chains directly into the Hashcat Command Builder with the mode and hash pre-filled",
      },
      {
        category: "Fixed",
        text: "Hashcat Command Builder: wordlist, mask, rules, session name, and output-file fields are now shell-quoted like the hash value already was, so paths containing spaces no longer silently broke the generated command",
      },
      {
        category: "Fixed",
        text: "Hashcat Command Builder: a hash value containing a single quote could break out of the command's quoting; it's now escaped correctly",
      },
      {
        category: "Fixed",
        text: "Hash Identifier: SHA3-256/Keccak-256 and Whirlpool/SHA3-512 were incorrectly sharing one Hashcat mode number each; they're now identified separately with their correct modes",
      },
    ],
  },
  {
    date: "2026-07-16",
    items: [
      {
        category: "Added",
        text: "HTTP Security Headers Analyzer tool: check any URL's response headers against the OWASP Secure Headers Project (HSTS, CSP, X-Frame-Options, and more), with pass/warn/missing status and plain-language fixes",
      },
      {
        category: "Added",
        text: "SPF/DKIM/DMARC Checker tool: check a domain's email authentication setup, with parsed SPF mechanisms and lookup-count tracking, DKIM selector lookups, and DMARC policy explanations",
      },
      { category: "Improved", text: "Shared no-wrap/wrap toggle for copyable code blocks, reused across tools" },
      {
        category: "Fixed",
        text: "Clicking \"no wrap\" on a combined copy format could overflow outside its container instead of scrolling within it",
      },
      {
        category: "Fixed",
        text: "SPF Checker: deep or multi-vendor include chains (3+ levels) could be under-counted against the RFC 7208 10-lookup limit, reporting a domain as fine when mail servers would actually treat it as a PermError; now recurses fully, with circular-include detection so it still can't hang",
      },
    ],
  },
  {
    date: "2026-07-14",
    items: [
      {
        category: "Added",
        text: "About page: why Payloadify exists, the no-server-contact privacy stance, and how to report issues or request tools",
      },
      { category: "Improved", text: "Header nav on mobile now collapses into a hamburger menu with a swipe-to-close drawer, instead of cramming into the small-screen width" },
      { category: "Improved", text: "Active nav link (About / All tools) is now highlighted in both the desktop nav and the mobile drawer" },
      {
        category: "Fixed",
        text: "Mobile nav drawer could get stuck open-but-hidden if the viewport crossed the mobile/desktop breakpoint (e.g. device rotation) while it was open",
      },
    ],
  },
  {
    date: "2026-07-13",
    items: [
      {
        category: "Added",
        text: "Subdomain Permutation Generator tool: build resolver-ready subdomain wordlists from environment, service, and region tokens plus your own keywords, entirely in your browser",
      },
      {
        category: "Added",
        text: "Copyable puredns/massdns/dnsx/shuffledns/zdns resolver commands on the Subdomain Permutation Generator, pre-filled with your chosen output filename",
      },
      { category: "Improved", text: "Editable download filename and a collapsible tool-references list, reused across the Subdomain Permutation Generator and JWT tools" },
      {
        category: "Fixed",
        text: "MSFVenom Generator: Windows x64 payloads (Meterpreter, Shell, VNC, PowerShell) now generate commands msfvenom actually accepts, since architecture is encoded in the payload path rather than a now-unsupported -a flag; the UDP shell payload is correctly limited to x86, and Meterpreter Reverse UDP (not a real msfvenom combination) has been removed",
      },
    ],
  },
  {
    date: "2026-07-12",
    items: [
      {
        category: "Added",
        text: "Changelog: see what's new on Payloadify, grouped by date and category, from the header",
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
        text: "JWT Generator tool: standard and enhanced secret keys, selectable 128-512-bit strength, secret masking, step-by-step walkthrough guide, \"copy all\" panel, and reference links",
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
        text: "Hardened CVSS template import validation: a corrupted or hand-edited import file could previously produce an incorrect (falsely \"Critical\") severity score instead of being rejected",
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
        text: "XSS generator: removed an unsafe \"cookie-exfil\" action, improved context-selection logic",
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
