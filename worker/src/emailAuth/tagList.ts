/** Shared semicolon-separated `tag=value` parsing for DKIM (RFC 6376 §3.2) and DMARC (RFC 7489
 *  §6.4) records — both use the same tag-list grammar. */
export function parseTagList(record: string): Map<string, string> {
  const tags = new Map<string, string>();
  for (const part of record.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim().toLowerCase();
    const value = trimmed.slice(eq + 1).trim();
    tags.set(key, value);
  }
  return tags;
}
