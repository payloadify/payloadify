/** Which syntactic position the injection point sits in within the vulnerable query — governs
 *  whether the payload needs to break out of a quote (and how) before the injected SQL.
 *  "numeric": unquoted parameter,  e.g. ... WHERE id = 3
 *  "string":  quoted parameter,    e.g. ... WHERE name = 'bob'
 *  "search":  LIKE parameter,      e.g. ... WHERE name LIKE '%bob%' */
export type SqliContext = "numeric" | "string" | "search";
