/** SSRF guard: is this resolved IP inside a private/loopback/link-local/reserved range that must
 *  never be reachable from the Security Headers Analyzer's outbound fetch? Per ANALYZER-SPECS.md's
 *  SSRF section, deliberately a superset of its minimum list (adds CGNAT, the TEST-NET ranges,
 *  multicast, and the broadcast address) — strictly safer, not scope creep. */

interface Cidr {
  base: bigint;
  bits: number;
  family: 4 | 6;
}

const IPV4_BLOCKED: Cidr[] = [
  cidr4("0.0.0.0/8"), // "this network"
  cidr4("10.0.0.0/8"), // RFC 1918
  cidr4("100.64.0.0/10"), // CGNAT (RFC 6598)
  cidr4("127.0.0.0/8"), // loopback
  cidr4("169.254.0.0/16"), // link-local — includes 169.254.169.254 cloud metadata
  cidr4("172.16.0.0/12"), // RFC 1918
  cidr4("192.0.0.0/24"), // IETF protocol assignments
  cidr4("192.0.2.0/24"), // TEST-NET-1
  cidr4("192.168.0.0/16"), // RFC 1918
  cidr4("198.18.0.0/15"), // benchmarking
  cidr4("198.51.100.0/24"), // TEST-NET-2
  cidr4("203.0.113.0/24"), // TEST-NET-3
  cidr4("224.0.0.0/4"), // multicast
  cidr4("240.0.0.0/4"), // reserved
  cidr4("255.255.255.255/32"), // limited broadcast
];

const IPV6_BLOCKED: Cidr[] = [
  cidr6("::1/128"), // loopback
  cidr6("::/128"), // unspecified
  cidr6("fc00::/7"), // unique local (covers fd00:ec2::254 AWS IMDSv6)
  cidr6("fe80::/10"), // link-local
  cidr6("2001:db8::/32"), // documentation
];

function ipv4ToBigInt(ip: string): bigint | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0n;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = (value << 8n) | BigInt(n);
  }
  return value;
}

function ipv6ToBigInt(ip: string): bigint | null {
  // Handle IPv4-mapped/compatible forms like "::ffff:192.168.0.1" by converting the trailing
  // dotted-quad into two hextets first.
  const ipv4Embedded = ip.match(/^([0-9a-fA-F:]*:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  let normalized = ip;
  if (ipv4Embedded) {
    const v4 = ipv4ToBigInt(ipv4Embedded[2]);
    if (v4 === null) return null;
    const hi = (v4 >> 16n) & 0xffffn;
    const lo = v4 & 0xffffn;
    normalized = `${ipv4Embedded[1]}${hi.toString(16)}:${lo.toString(16)}`;
  }

  const doubleColonSplit = normalized.split("::");
  if (doubleColonSplit.length > 2) return null;

  let head: string[];
  let tail: string[];
  if (doubleColonSplit.length === 2) {
    head = doubleColonSplit[0] === "" ? [] : doubleColonSplit[0].split(":");
    tail = doubleColonSplit[1] === "" ? [] : doubleColonSplit[1].split(":");
    const missing = 8 - head.length - tail.length;
    if (missing < 0) return null;
    head = [...head, ...Array(missing).fill("0"), ...tail];
  } else {
    head = normalized.split(":");
    if (head.length !== 8) return null;
  }

  let value = 0n;
  for (const hextet of head) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(hextet)) return null;
    value = (value << 16n) | BigInt(parseInt(hextet, 16));
  }
  return value;
}

function cidr4(notation: string): Cidr {
  const [addr, bitsStr] = notation.split("/");
  const base = ipv4ToBigInt(addr);
  if (base === null) throw new Error(`Invalid IPv4 CIDR literal: ${notation}`);
  return { base, bits: Number(bitsStr), family: 4 };
}

function cidr6(notation: string): Cidr {
  const [addr, bitsStr] = notation.split("/");
  const base = ipv6ToBigInt(addr);
  if (base === null) throw new Error(`Invalid IPv6 CIDR literal: ${notation}`);
  return { base, bits: Number(bitsStr), family: 6 };
}

function inRange(ip: bigint, totalBits: number, range: Cidr): boolean {
  if (range.bits === 0) return true;
  const shift = BigInt(totalBits - range.bits);
  return ip >> shift === range.base >> shift;
}

/** True if `ip` (a literal IPv4 or IPv6 address string) falls inside any blocked range. Unwraps
 *  IPv4-mapped IPv6 (::ffff:a.b.c.d) and NAT64 (64:ff9b::/96) addresses and re-checks the embedded
 *  IPv4 address, per the spec's DNS-rebinding-adjacent "don't just string-match" requirement. */
export function isBlockedIp(ip: string): boolean {
  const v4 = ipv4ToBigInt(ip);
  if (v4 !== null) {
    return IPV4_BLOCKED.some((range) => inRange(v4, 32, range));
  }

  const v6 = ipv6ToBigInt(ip);
  if (v6 === null) return true; // unparseable input — fail closed, never treat as safe.

  if (IPV6_BLOCKED.some((range) => inRange(v6, 128, range))) return true;

  // ::ffff:0:0/96 (IPv4-mapped) and 64:ff9b::/96 (NAT64) — unwrap the embedded IPv4 in the low 32
  // bits and recheck it against the IPv4 list. Prefixes are derived via the same parser (rather than
  // hand-computed hex constants) so a transcription slip here can't silently under-block.
  const ipv4MappedPrefix = ipv6ToBigInt("::ffff:0:0")! >> 32n;
  const nat64Prefix = ipv6ToBigInt("64:ff9b::")! >> 32n;
  const top96 = v6 >> 32n;
  if (top96 === ipv4MappedPrefix || top96 === nat64Prefix) {
    const embedded = v6 & 0xffffffffn;
    return IPV4_BLOCKED.some((range) => inRange(embedded, 32, range));
  }

  return false;
}
