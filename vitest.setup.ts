// js-md4 delegates to Node's native crypto.createHash('md4') when it detects a Node
// environment — which is disabled under modern OpenSSL and, more importantly, never
// happens in the actual browser this site runs in. Setting this flag forces js-md4's own
// pure-JS implementation instead, so tests exercise the exact code path production uses.
if (typeof window !== "undefined") {
  (window as unknown as { JS_MD4_NO_NODE_JS: boolean }).JS_MD4_NO_NODE_JS = true;
}
