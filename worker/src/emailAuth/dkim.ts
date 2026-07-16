import { queryDns, stripDnsTxtQuotes, type DnsRecordType } from "../dns/doh";
import { parseTagList } from "./tagList";

const RR_TYPE_TXT = 16;

export type DnsQueryFn = (name: string, type: DnsRecordType) => Promise<{ type: number; data: string }[]>;

export interface DkimSelectorResult {
  selector: string;
  found: boolean;
  record: string | null;
  /** RFC 6376 §3.6.1: the `v=` tag, if present, must be `DKIM1` — but the tag itself is optional
   *  and defaults to DKIM1 when absent, so `null` here does not mean "not DKIM". */
  version: string | null;
  keyType: string;
  publicKeyPresent: boolean;
  /** RFC 6376 §3.6.1: an empty `p=` tag means the key has been revoked — distinct from "not
   *  found" (no record at all) and worth flagging specially rather than reporting a bare "found". */
  revoked: boolean;
}

async function fetchDkimTexts(name: string, queryFn: DnsQueryFn): Promise<string[]> {
  const answers = await queryFn(name, "TXT");
  return answers.filter((a) => a.type === RR_TYPE_TXT).map((a) => stripDnsTxtQuotes(a.data));
}

export async function checkDkimSelector(domain: string, selector: string, queryFn: DnsQueryFn = queryDns): Promise<DkimSelectorResult> {
  const name = `${selector}._domainkey.${domain}`;
  const texts = await fetchDkimTexts(name, queryFn);
  const record = texts.find((t) => /(^|;)\s*v=dkim1/i.test(t)) ?? texts[0] ?? null;

  if (!record) {
    return { selector, found: false, record: null, version: null, keyType: "rsa", publicKeyPresent: false, revoked: false };
  }

  const tags = parseTagList(record);
  const p = tags.get("p");

  return {
    selector,
    found: true,
    record,
    version: tags.get("v") ?? null,
    keyType: tags.get("k") ?? "rsa",
    publicKeyPresent: !!p && p.length > 0,
    revoked: p !== undefined && p.length === 0,
  };
}

export async function checkDkim(domain: string, selectors: string[], queryFn: DnsQueryFn = queryDns): Promise<DkimSelectorResult[]> {
  return Promise.all(selectors.map((selector) => checkDkimSelector(domain, selector, queryFn)));
}
