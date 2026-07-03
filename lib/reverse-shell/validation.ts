export type HostKind = "ipv4" | "hostname" | "invalid";

export interface HostValidation {
  ok: boolean;
  kind: HostKind;
  message?: string;
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

// RFC 1123-ish hostname: labels of alphanumerics/hyphens, no leading/trailing hyphen, dot-separated.
const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$/;

/** IPv4 or hostname only — IPv6 is out of scope for v1, since several of the shell one-liners
 *  (notably the bash /dev/tcp and PowerShell TCP client forms) need bracket/format handling that
 *  hasn't been verified per-payload yet. Rejecting explicitly here beats silently mangling it. */
export function validateHost(value: string): HostValidation {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: false, kind: "invalid", message: "Enter a target IP or hostname." };

  if (trimmed.includes(":")) {
    return { ok: false, kind: "invalid", message: "IPv6 targets aren't supported yet — use an IPv4 address or hostname." };
  }

  const ipMatch = trimmed.match(IPV4_RE);
  if (ipMatch) {
    const inRange = ipMatch.slice(1, 5).every((octet) => Number(octet) <= 255);
    return inRange
      ? { ok: true, kind: "ipv4" }
      : { ok: false, kind: "invalid", message: "Each IPv4 octet must be 0-255." };
  }

  if (HOSTNAME_RE.test(trimmed)) return { ok: true, kind: "hostname" };

  return { ok: false, kind: "invalid", message: "Enter a valid IPv4 address or hostname." };
}

export function isValidPort(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

export function clampPort(value: number): number {
  if (!Number.isFinite(value)) return 4444;
  return Math.min(65535, Math.max(1, Math.round(value)));
}

/** Companion listener command shown alongside the generated payload — the attacker-side command
 *  to run before triggering the payload on the target. Most catalog entries pair with a plain nc
 *  listener; a few (e.g. socat) need a different listener and override this via
 *  ShellVariant.listener instead of using this default. */
export function defaultListener(port: number): string {
  return `nc -lvnp ${port}`;
}
