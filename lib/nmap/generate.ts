import { NMAP_TEMPLATES_BY_ID } from "./templates";
import { NmapSelection, PingProbeId } from "./params";

/** Single-quotes an arbitrary value for safe inclusion in a bash command line, escaping any
 *  embedded single quotes with the standard '\'' technique (close the quote, emit an escaped
 *  quote, reopen the quote). Without this, a value containing a `'` breaks out of the quoting
 *  entirely when the generated command is pasted into a shell. Applied to every free-text field
 *  below (targets, exclude lists, script expressions, output paths, and more) since any of them
 *  can contain spaces or shell metacharacters just as easily as a hash value can (see the
 *  identical helper in lib/hashcat/generate.ts, duplicated here rather than shared per this
 *  repo's existing convention of one copy per tool). */
function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** nmap has no comma-separated target syntax of its own — a literal `nmap 'host1,host2'` would
 *  be parsed as one bad hostname. Splits on commas/newlines into separate, individually-quoted
 *  positional target tokens instead. */
export function splitTargetList(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

const FILE_TARGET_EXTENSIONS = [".txt", ".lst", ".list", ".csv"];

export type DetectedTargetKind = "host" | "list" | "file";

/** Auto-detects what kind of target the user typed, so the target field can stay a single
 *  free-text input instead of a manual host/CIDR/list/file toggle (a bare host and a bare CIDR
 *  were always handled identically anyway). Rules, in order:
 *  1. A comma or newline anywhere means multiple targets: "list".
 *  2. Otherwise, a recognized text-file extension (.txt/.lst/.list/.csv) means "file" (-iL).
 *  3. Otherwise "host" — this deliberately covers plain IPs, CIDR ranges, domains, AND bare
 *     hostnames with no dot at all (e.g. "dc01"), since dotless internal hostnames are common
 *     in this audience's actual work and must not be misclassified as a file path just because
 *     they lack a TLD. */
export function detectTargetKind(raw: string): DetectedTargetKind {
  if (/[,\n]/.test(raw)) return "list";
  const lower = raw.trim().toLowerCase();
  if (FILE_TARGET_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "file";
  return "host";
}

const PING_PROBE_ORDER: PingProbeId[] = ["PS", "PA", "PU", "PY", "PE", "PP", "PM", "PO", "PR"];

/** Shared by both template and custom mode. -6 (custom mode only) is prepended here rather than
 *  built separately since it always belongs immediately before the target tokens. */
function buildTargetFlags(sel: NmapSelection): string[] {
  const parts: string[] = [];
  if (sel.mode === "custom" && sel.ipv6) parts.push("-6");

  const { value } = sel.target;
  const trimmed = value.trim();
  const kind = detectTargetKind(value);

  if (kind === "file") {
    parts.push("-iL", quoteShellArg(trimmed));
  } else if (kind === "list") {
    parts.push(...splitTargetList(value).map(quoteShellArg));
  } else {
    parts.push(quoteShellArg(trimmed));
  }

  return parts;
}

function buildExcludeFlags(sel: NmapSelection): string[] {
  const trimmed = sel.exclude.value.trim();
  if (trimmed.length === 0) return [];
  const kind = detectTargetKind(sel.exclude.value);
  return kind === "file" ? ["--excludefile", quoteShellArg(trimmed)] : ["--exclude", quoteShellArg(trimmed)];
}

function buildOutputFlags(sel: NmapSelection): string[] {
  const parts: string[] = [];
  const path = sel.output.path.trim();
  if (sel.output.format !== "none" && path.length > 0) {
    parts.push(`-${sel.output.format}`, quoteShellArg(path));
  }
  const statsEvery = sel.output.statsEvery.trim();
  if (statsEvery.length > 0) parts.push("--stats-every", quoteShellArg(statsEvery));
  return parts;
}

/** Builds the custom-mode flag set. nmap's flags are almost entirely order-independent to the
 *  tool itself (unlike hashcat's positional wordlist/mask args) — the order below exists purely
 *  for deterministic, testable, readable output, not because it's semantically required:
 *  scan type -> host discovery -> port spec -> service/OS detection -> NSE scripts ->
 *  timing/performance -> evasion/spoofing -> DNS resolution -> troubleshooting/misc. */
function buildCustomFlags(sel: NmapSelection): string[] {
  const parts: string[] = [];

  // Scan type
  if (sel.scanType === "sI") {
    parts.push("-sI", quoteShellArg(sel.zombieHost.trim()));
  } else {
    parts.push(`-${sel.scanType}`);
  }

  // Host discovery
  const { hostDiscovery } = sel;
  if (hostDiscovery.noPing) {
    parts.push("-Pn");
  } else {
    for (const probe of PING_PROBE_ORDER) {
      if (!(probe in hostDiscovery.probes)) continue;
      const arg = (hostDiscovery.probes[probe] ?? "").trim();
      parts.push(arg.length > 0 ? `-${probe}${arg}` : `-${probe}`);
    }
  }

  // Port specification — doesn't apply to scan types that never touch ports.
  const portsApply = sel.scanType !== "sn" && sel.scanType !== "sL";
  if (portsApply) {
    const { portSpec } = sel;
    if (portSpec.mode === "fast") parts.push("-F");
    else if (portSpec.mode === "all") parts.push("-p", "1-65535");
    else if (portSpec.mode === "top" && portSpec.topPortsN !== null) parts.push("--top-ports", String(portSpec.topPortsN));
    else if (portSpec.mode === "custom" && portSpec.customPorts.trim().length > 0) {
      parts.push("-p", quoteShellArg(portSpec.customPorts.trim()));
    }
    if (portSpec.sequential) parts.push("-r");
  }

  // Service / OS detection
  const svc = sel.serviceOsDetection;
  if (svc.aggressive) {
    parts.push("-A");
  } else {
    if (svc.versionDetection) {
      parts.push("-sV");
      if (svc.versionTrace) parts.push("--version-trace");
    }
    if (svc.osDetection) {
      parts.push("-O");
      if (svc.osScanGuess) parts.push("--osscan-guess");
    }
  }

  // NSE script scanning — -sC is skipped when -A already implies it.
  const scripts = sel.scriptScan;
  if (!svc.aggressive && scripts.defaultScripts) parts.push("-sC");
  if (scripts.scriptExpression.trim().length > 0) parts.push("--script", quoteShellArg(scripts.scriptExpression.trim()));
  if (scripts.scriptTrace) parts.push("--script-trace");
  if (scripts.scriptUpdateDb) parts.push("--script-updatedb");

  // Timing & performance
  const t = sel.timingPerformance;
  if (t.timingTemplate !== null) parts.push(`-T${t.timingTemplate}`);
  if (t.ttl !== null) parts.push("--ttl", String(t.ttl));
  if (t.minParallelism !== null) parts.push("--min-parallelism", String(t.minParallelism));
  if (t.maxParallelism !== null) parts.push("--max-parallelism", String(t.maxParallelism));
  if (t.minHostgroup !== null) parts.push("--min-hostgroup", String(t.minHostgroup));
  if (t.maxHostgroup !== null) parts.push("--max-hostgroup", String(t.maxHostgroup));
  if (t.initialRttTimeout.trim().length > 0) parts.push("--initial-rtt-timeout", quoteShellArg(t.initialRttTimeout.trim()));
  if (t.maxRttTimeout.trim().length > 0) parts.push("--max-rtt-timeout", quoteShellArg(t.maxRttTimeout.trim()));
  if (t.maxRetries !== null) parts.push("--max-retries", String(t.maxRetries));
  if (t.hostTimeout.trim().length > 0) parts.push("--host-timeout", quoteShellArg(t.hostTimeout.trim()));
  if (t.scanDelay.trim().length > 0) parts.push("--scan-delay", quoteShellArg(t.scanDelay.trim()));
  if (t.maxScanDelay.trim().length > 0) parts.push("--max-scan-delay", quoteShellArg(t.maxScanDelay.trim()));
  if (t.minRate !== null) parts.push("--min-rate", String(t.minRate));
  if (t.maxRate !== null) parts.push("--max-rate", String(t.maxRate));
  if (t.defeatRstRatelimit) parts.push("--defeat-rst-ratelimit");

  // Evasion / spoofing
  const e = sel.evasionSpoofing;
  if (e.fragmentPackets) parts.push("-f");
  if (e.mtu !== null) parts.push("--mtu", String(e.mtu));
  if (e.decoyCount !== null && e.decoyCount > 0) parts.push("-D", `RND:${e.decoyCount}`);
  if (e.sourcePort !== null) parts.push("--source-port", String(e.sourcePort));
  if (e.dataLength !== null) parts.push("--data-length", String(e.dataLength));
  if (e.randomizeHosts) parts.push("--randomize-hosts");
  if (e.spoofMac.trim().length > 0) parts.push("--spoof-mac", quoteShellArg(e.spoofMac.trim()));
  if (e.badsum) parts.push("--badsum");

  // DNS resolution
  const dns = sel.dns;
  if (dns.alwaysResolve) parts.push("-R");
  else if (dns.neverResolve) parts.push("-n");
  if (dns.systemDns) parts.push("--system-dns");
  if (dns.dnsServers.trim().length > 0) parts.push("--dns-servers", quoteShellArg(dns.dnsServers.trim()));
  if (dns.traceroute && !svc.aggressive) parts.push("--traceroute");

  // Troubleshooting / misc
  const misc = sel.misc;
  if (misc.reason) parts.push("--reason");
  if (misc.openOnly) parts.push("--open");
  if (misc.packetTrace) parts.push("--packet-trace");
  if (misc.ifList) parts.push("--iflist");
  if (misc.interfaceName.trim().length > 0) parts.push("-e", quoteShellArg(misc.interfaceName.trim()));
  if (misc.verbose) parts.push("-v");
  if (misc.debug) parts.push("-d");

  return parts;
}

/** Pure, deterministic command builder for both Scenario Templates and Custom Build modes. */
export function buildCommand(sel: NmapSelection): string {
  const parts: string[] = ["nmap"];

  if (sel.mode === "template") {
    const template = NMAP_TEMPLATES_BY_ID[sel.templateId ?? ""];
    if (template) parts.push(...template.fixedFlags);
  } else {
    parts.push(...buildCustomFlags(sel));
  }

  parts.push(...buildTargetFlags(sel), ...buildExcludeFlags(sel), ...buildOutputFlags(sel));

  return parts.join(" ");
}
