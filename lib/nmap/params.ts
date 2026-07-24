export type NmapMode = "template" | "custom";

/** Single free-text target field — the kind (single host/CIDR, a list, or a file path) is
 *  auto-detected from the value itself rather than chosen by the user, since a manual
 *  host/CIDR/list/file toggle offered no real distinction the user couldn't just type directly.
 *  See detectTargetKind() in generate.ts for the detection rules. */
export interface NmapTarget {
  value: string;
}

/** Single free-text field, same auto-detect idea as NmapTarget: an empty value means no exclude
 *  flag at all, a file-like value (see detectTargetKind()) becomes --excludefile, anything else
 *  becomes --exclude (passed through as one comma-joined argument, unlike bare targets, since
 *  --exclude natively accepts a comma-separated host list within a single CLI argument). */
export interface NmapExclude {
  value: string;
}

export type NmapOutputFormat = "none" | "oN" | "oX" | "oG" | "oS" | "oA";

export interface NmapOutput {
  format: NmapOutputFormat;
  path: string;
  /** --stats-every <value>, e.g. "10s". Blank means omitted regardless of format. */
  statsEvery: string;
}

// ---- Custom Build mode only, ignored by buildCommand while mode === "template" ----

/** Single-select only. Real nmap can combine scan types (e.g. -sS -sU together with
 *  -p U:...,T:... port syntax), but that combined form isn't in the confirmed flag reference
 *  this tool is built from, so it's intentionally unsupported. -sP is omitted as a documented
 *  duplicate of -sn; -h/-V are standalone informational invocations, not composable scan flags.
 *  -sR is deliberately excluded too: nmap's own man page (man-version-detection.html) states
 *  "-sR is an alias for -sV. Prior to March 2011, it was used to activate the RPC grinder
 *  separately from version detection, but now these options are always combined", so it isn't
 *  a real standalone scan type, it's just -sV under an old name, which this tool already exposes
 *  directly under Service/OS Detection. */
export type CustomScanTypeId = "sS" | "sT" | "sU" | "sN" | "sF" | "sX" | "sA" | "sO" | "sL" | "sI" | "sW" | "sn";

export type PortSpecMode = "default" | "fast" | "all" | "top" | "custom";

export interface PortSpec {
  /** "default" emits no -p/-F/--top-ports flag at all (nmap's own default port set). */
  mode: PortSpecMode;
  topPortsN: number | null;
  /** Free text: a port list/range or service name(s), e.g. "22,80,443" or "http,https". */
  customPorts: string;
  sequential: boolean;
}

export interface ServiceOsDetection {
  /** When true, -sV/-O/-sC/--traceroute below are never independently emitted even if also
   *  set, since -A already implies all four. */
  aggressive: boolean;
  versionDetection: boolean;
  versionTrace: boolean;
  osDetection: boolean;
  osScanGuess: boolean;
}

export interface ScriptScan {
  defaultScripts: boolean;
  /** --script <value>: a script name, expression, category, or comma-separated categories. */
  scriptExpression: string;
  scriptTrace: boolean;
  scriptUpdateDb: boolean;
}

export interface TimingPerformance {
  timingTemplate: 0 | 1 | 2 | 3 | 4 | 5 | null;
  ttl: number | null;
  minParallelism: number | null;
  maxParallelism: number | null;
  minHostgroup: number | null;
  maxHostgroup: number | null;
  /** Free text since nmap accepts unit suffixes here, e.g. "100ms" or "2s". */
  initialRttTimeout: string;
  maxRttTimeout: string;
  maxRetries: number | null;
  hostTimeout: string;
  scanDelay: string;
  maxScanDelay: string;
  minRate: number | null;
  maxRate: number | null;
  defeatRstRatelimit: boolean;
}

export interface EvasionSpoofing {
  fragmentPackets: boolean;
  mtu: number | null;
  /** Renders "-D RND:<n>" — the only decoy form in the confirmed flag reference. A literal
   *  decoy-IP-list form is real nmap syntax but not documented in that reference, so it's
   *  intentionally unsupported here. */
  decoyCount: number | null;
  sourcePort: number | null;
  dataLength: number | null;
  randomizeHosts: boolean;
  /** Free text (vendor prefix, "0", or a literal MAC) — the reference doesn't detail the exact
   *  accepted forms, kept free-form rather than guessing a stricter shape. */
  spoofMac: string;
  badsum: boolean;
}

export type PingProbeId = "PS" | "PA" | "PU" | "PY" | "PE" | "PP" | "PM" | "PO" | "PR";

export interface HostDiscovery {
  /** -Pn. When true, every probe below is unused (host discovery is skipped entirely). */
  noPing: boolean;
  /** Probe id -> optional port-list argument text, rendered with no space (e.g. "-PS22,80,443")
   *  when non-empty, else the bare flag (e.g. "-PS"). */
  probes: Partial<Record<PingProbeId, string>>;
}

export interface DnsOptions {
  /** -R and -n are opposites (always vs. never resolve); both true is invalid. */
  alwaysResolve: boolean;
  neverResolve: boolean;
  systemDns: boolean;
  dnsServers: string;
  traceroute: boolean;
}

export interface MiscOptions {
  reason: boolean;
  openOnly: boolean;
  packetTrace: boolean;
  ifList: boolean;
  interfaceName: string;
  verbose: boolean;
  debug: boolean;
}

export interface NmapSelection {
  mode: NmapMode;
  /** Set only while mode === "template". */
  templateId: string | null;

  target: NmapTarget;
  exclude: NmapExclude;
  output: NmapOutput;
  /** -6. Custom mode only; template mode doesn't expose this toggle. */
  ipv6: boolean;

  // Custom Build mode only — ignored entirely by the template branch of buildCommand.
  scanType: CustomScanTypeId;
  /** Required only when scanType === "sI" (idle/zombie scan needs a zombie host argument). */
  zombieHost: string;
  portSpec: PortSpec;
  serviceOsDetection: ServiceOsDetection;
  scriptScan: ScriptScan;
  timingPerformance: TimingPerformance;
  evasionSpoofing: EvasionSpoofing;
  hostDiscovery: HostDiscovery;
  dns: DnsOptions;
  misc: MiscOptions;
}
