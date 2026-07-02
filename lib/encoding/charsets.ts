export type Charset = { id: string; label: string; encodable: boolean };

export const DEFAULT_CHARSET = "utf-8";

/** Decode-direction-only pseudo-entry, shown above the grouped list. */
export const AUTO_DETECT_CHARSET = "auto";

export const CHARSET_GROUPS: { label: string; charsets: Charset[] }[] = [
  {
    label: "Unicode",
    charsets: [
      { id: "utf-8", label: "UTF-8", encodable: true },
      { id: "utf-16le", label: "UTF-16LE", encodable: true },
      { id: "utf-16be", label: "UTF-16BE", encodable: true },
    ],
  },
  {
    label: "Western European",
    charsets: [
      { id: "iso-8859-1", label: "ISO-8859-1 / Windows-1252 (Latin-1)", encodable: false },
      { id: "iso-8859-15", label: "ISO-8859-15 (Latin-9)", encodable: false },
      { id: "windows-1252", label: "Windows-1252", encodable: false },
    ],
  },
  {
    label: "Central/Eastern European",
    charsets: [
      { id: "iso-8859-2", label: "ISO-8859-2", encodable: false },
      { id: "windows-1250", label: "Windows-1250", encodable: false },
      { id: "windows-1257", label: "Windows-1257 (Baltic)", encodable: false },
    ],
  },
  {
    label: "Cyrillic",
    charsets: [
      { id: "iso-8859-5", label: "ISO-8859-5", encodable: false },
      { id: "windows-1251", label: "Windows-1251", encodable: false },
      { id: "koi8-r", label: "KOI8-R", encodable: false },
      { id: "koi8-u", label: "KOI8-U", encodable: false },
    ],
  },
  {
    label: "Turkish/Greek/Hebrew/Arabic/Thai",
    charsets: [
      { id: "iso-8859-7", label: "ISO-8859-7 (Greek)", encodable: false },
      { id: "windows-1253", label: "Windows-1253 (Greek)", encodable: false },
      { id: "iso-8859-9", label: "ISO-8859-9 / Windows-1254 (Turkish)", encodable: false },
      { id: "windows-1255", label: "Windows-1255 (Hebrew)", encodable: false },
      { id: "windows-1256", label: "Windows-1256 (Arabic)", encodable: false },
      { id: "iso-8859-11", label: "Windows-874 (Thai)", encodable: false },
    ],
  },
  {
    label: "Asian (CJK)",
    charsets: [
      { id: "shift-jis", label: "Shift-JIS", encodable: false },
      { id: "euc-jp", label: "EUC-JP", encodable: false },
      { id: "euc-kr", label: "EUC-KR", encodable: false },
      { id: "gbk", label: "GBK", encodable: false },
      { id: "gb18030", label: "GB18030", encodable: false },
      { id: "big5", label: "Big5", encodable: false },
    ],
  },
];

const ALL_CHARSETS = CHARSET_GROUPS.flatMap((group) => group.charsets);

export function isEncodable(id: string): boolean {
  return ALL_CHARSETS.some((c) => c.id === id && c.encodable);
}

/** BOM sniffing + UTF-8-validity check only — deliberately does not attempt statistical
 *  language detection to distinguish legacy 8-bit/CJK charsets (that's a dedicated library's
 *  job); a confidently-wrong guess is worse than an honest "couldn't detect" for this tool. */
export function detectCharset(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return "utf-8";
  } catch {
    return null;
  }
}
