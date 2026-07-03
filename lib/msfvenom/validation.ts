import type { EncoderId, MsfvenomEncoder } from "./encoders";

export type HostKind = "ipv4" | "ipv6" | "hostname" | "invalid";

export interface HostValidation {
  ok: boolean;
  kind: HostKind;
  message?: string;
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

// RFC 1123-ish hostname: labels of alphanumerics/hyphens, no leading/trailing hyphen, dot-separated.
const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;

const HEX_GROUP_RE = /^[0-9a-fA-F]{1,4}$/;

/** Hand-rolled rather than a single mega-regex — IPv6's "::" zero-compression makes a fully
 *  correct regex notoriously easy to get subtly wrong. Splits on "::" (at most one allowed),
 *  then validates each remaining colon-separated group is 1-4 hex digits, and that the total
 *  group count is consistent with whether compression was used. */
function isValidIpv6(value: string): boolean {
  const firstDoubleColon = value.indexOf("::");
  const lastDoubleColon = value.lastIndexOf("::");
  if (firstDoubleColon !== lastDoubleColon) return false; // more than one "::"

  const hasCompression = firstDoubleColon !== -1;
  const [head, tail] = hasCompression ? value.split("::") : [value, ""];

  const headGroups = head.length === 0 ? [] : head.split(":");
  const tailGroups = hasCompression && tail.length > 0 ? tail.split(":") : [];
  const allGroups = [...headGroups, ...tailGroups];

  if (!allGroups.every((g) => HEX_GROUP_RE.test(g))) return false;

  return hasCompression ? allGroups.length <= 7 : allGroups.length === 8;
}

/** msfvenom's LHOST is a bare value inside a `LHOST=<value>` command-line argument — unlike a
 *  shell one-liner's target, there's no bracket/escaping concern, so IPv6 is fully supported here. */
export function validateLhost(value: string): HostValidation {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: false, kind: "invalid", message: "Enter a target IP or hostname." };

  const ipv4Match = trimmed.match(IPV4_RE);
  if (ipv4Match) {
    const inRange = ipv4Match.slice(1, 5).every((octet) => Number(octet) <= 255);
    return inRange ? { ok: true, kind: "ipv4" } : { ok: false, kind: "invalid", message: "Each IPv4 octet must be 0-255." };
  }

  if (trimmed.includes(":")) {
    return isValidIpv6(trimmed)
      ? { ok: true, kind: "ipv6" }
      : { ok: false, kind: "invalid", message: "Enter a valid IPv6 address." };
  }

  if (HOSTNAME_RE.test(trimmed)) return { ok: true, kind: "hostname" };

  return { ok: false, kind: "invalid", message: "Enter a valid IPv4/IPv6 address or hostname." };
}

export function isValidPort(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

export function clampPort(value: number): number {
  if (!Number.isFinite(value)) return 4444;
  return Math.min(65535, Math.max(1, Math.round(value)));
}

/** Iterations only matter once an encoder is selected — with encoderId "none" any value is
 *  treated as valid since it won't appear in the generated command at all. */
export function isValidIterations(value: number, encoderId: EncoderId): boolean {
  if (encoderId === "none") return true;
  return Number.isInteger(value) && value >= 1 && value <= 10;
}

export function clampIterations(value: number, encoder: MsfvenomEncoder): number {
  if (encoder.id === "none") return 0;
  if (!Number.isFinite(value)) return 1;
  return Math.min(encoder.maxIterations, Math.max(1, Math.round(value)));
}

const FILENAME_RE = /^[A-Za-z0-9._-]+$/;

export function isValidFilename(name: string): boolean {
  return name.length > 0 && name.length <= 100 && FILENAME_RE.test(name);
}

export function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 100);
  return cleaned.length > 0 ? cleaned : fallback;
}
