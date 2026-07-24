import {
  CustomScanTypeId,
  DnsOptions,
  EvasionSpoofing,
  HostDiscovery,
  MiscOptions,
  PortSpec,
  ScriptScan,
  ServiceOsDetection,
  TimingPerformance,
} from "./params";

/** Same custom-build fields buildCustomFlags() in generate.ts reads, expressed as partial
 *  overrides on top of that mode's own defaults. Lets "Custom Build" pick up where a template
 *  left off when the user switches modes, without the two modes' state needing to be unified. */
export interface NmapTemplateCustomOverrides {
  scanType?: CustomScanTypeId;
  portSpec?: Partial<PortSpec>;
  serviceOsDetection?: Partial<ServiceOsDetection>;
  scriptScan?: Partial<ScriptScan>;
  timingPerformance?: Partial<TimingPerformance>;
  evasionSpoofing?: Partial<EvasionSpoofing>;
  hostDiscovery?: Partial<HostDiscovery>;
  dns?: Partial<DnsOptions>;
  misc?: Partial<MiscOptions>;
  ipv6?: boolean;
}

/** Groups templates for the picker's <optgroup>s. "common-scenarios" is the original 8
 *  cheatsheet-sourced templates (rendered first), "payloadify-advanced" is the newer
 *  timing/performance-focused set (rendered second). */
export type NmapTemplateCategory = "common-scenarios" | "payloadify-advanced";

export interface NmapTemplate {
  id: string;
  label: string;
  /** One-line scenario summary, shown next to the label in the picker. */
  description: string;
  /** Already-ordered, fixed CLI tokens for this scenario, spliced verbatim right after "nmap"
   *  and before target/exclude/output flags. Never derived from or overwritten by any other
   *  field — template mode intentionally has no per-flag editability, per the product decision
   *  that scenario templates should rarely be tweaked unless the user understands nmap deeply. */
  fixedFlags: string[];
  /** "Why use this / when to use it", shown under the picker once a template is selected. */
  notes: string;
  /** The same scenario translated into Custom Build's structured fields, applied when the user
   *  switches from Template to Custom mode so they can tweak from where the template left off
   *  instead of starting over from Custom Build's own blank defaults. Kept hand-mapped alongside
   *  fixedFlags (not derived from it) since fixedFlags is a flat token list with no reliable
   *  general parse back into the structured shape. */
  customOverrides: NmapTemplateCustomOverrides;
  category: NmapTemplateCategory;
}

/** The 8 "common-scenarios" templates below are drawn only from the confirmed Nmap-Cheatsheet
 *  reference this tool was built against (github.com/jasonniebauer/Nmap-Cheatsheet). The 5
 *  "payloadify-advanced" templates that follow are drawn from nmap's own timing/performance
 *  documentation (nmap.org/book/man-performance.html) instead. Nothing here is an invented flag
 *  or an assumed-but-unverified combination. */
export const NMAP_TEMPLATES: NmapTemplate[] = [
  {
    id: "fast-scan",
    label: "Fast Scan",
    description: "Quick look at the top 100 ports.",
    category: "common-scenarios",
    fixedFlags: ["-F", "-T4"],
    notes:
      "-F scans only the top 100 most common ports (the reference's own documented fast-scan example), -T4 keeps it quick. Best first pass on a host you don't know anything about yet.",
    customOverrides: {
      portSpec: { mode: "fast" },
      timingPerformance: { timingTemplate: 4 },
    },
  },
  {
    id: "stealth-scan",
    label: "Stealth Scan",
    description: "Quieter SYN scan, avoids completing the TCP handshake.",
    category: "common-scenarios",
    fixedFlags: ["-sS", "-T2", "-Pn"],
    notes:
      "-sS (SYN scan) never completes the TCP handshake, so it's less likely to be logged at the application layer. -T2 (polite timing) spaces packets out to reduce IDS/rate-based detection. -Pn skips the host-discovery ping, since a ping probe is itself often blocked or logged and would defeat the point of trying to be quiet.",
    customOverrides: {
      scanType: "sS",
      hostDiscovery: { noPing: true },
      timingPerformance: { timingTemplate: 2 },
    },
  },
  {
    id: "full-port-scan",
    label: "Full Port Scan",
    description: "Every TCP port, 1 through 65535.",
    category: "common-scenarios",
    fixedFlags: ["-sS", "-p", "1-65535", "-T4"],
    notes:
      "-p 1-65535 scans every TCP port instead of nmap's default top-1000, -sS keeps the scan type defined and efficient, -T4 keeps a 65535-port scan tractable. Use this when a fast/aggressive scan might have missed a service on a non-standard port.",
    customOverrides: {
      scanType: "sS",
      portSpec: { mode: "all" },
      timingPerformance: { timingTemplate: 4 },
    },
  },
  {
    id: "aggressive-scan",
    label: "Aggressive Scan (Version + OS)",
    description: "OS detection, version detection, default scripts, and traceroute in one flag.",
    category: "common-scenarios",
    fixedFlags: ["-A", "-T4"],
    notes:
      "-A is nmap's own documented all-in-one flag: OS detection, service version detection, default NSE scripts, and traceroute. It does not scan more ports than nmap's default top-1000, it adds detection depth on the ports it does scan. -T4 for speed given the extra work -A already does.",
    customOverrides: {
      serviceOsDetection: { aggressive: true },
      timingPerformance: { timingTemplate: 4 },
    },
  },
  {
    id: "udp-scan",
    label: "UDP Scan",
    description: "Checks the top 100 UDP ports.",
    category: "common-scenarios",
    fixedFlags: ["-sU", "--top-ports", "100", "-T4"],
    notes:
      "-sU scans UDP instead of TCP, which many scanners skip entirely even though services like DNS/SNMP/DHCP live there. --top-ports 100 keeps it practical, since a full 65535-port UDP scan is notoriously slow. -T4 for speed.",
    customOverrides: {
      scanType: "sU",
      portSpec: { mode: "top", topPortsN: 100 },
      timingPerformance: { timingTemplate: 4 },
    },
  },
  {
    id: "vuln-script-scan",
    label: "Vulnerability / Script Scan",
    description: "Runs NSE's default and vulnerability-focused scripts.",
    category: "common-scenarios",
    fixedFlags: ["-sV", "-sC", "--script", "vuln", "-T4"],
    notes:
      "-sV feeds version info to scripts that need it, -sC runs nmap's default script set, --script vuln adds the vuln NSE category on top. -T4 for speed. Use this after you already know which ports are open (e.g. from a Fast or Full Port Scan first).",
    customOverrides: {
      serviceOsDetection: { versionDetection: true },
      scriptScan: { defaultScripts: true, scriptExpression: "vuln" },
      timingPerformance: { timingTemplate: 4 },
    },
  },
  {
    id: "host-discovery",
    label: "Host Discovery / Ping Sweep",
    description: "Finds which hosts are alive, no port scan at all.",
    category: "common-scenarios",
    fixedFlags: ["-sn"],
    notes:
      "-sn is a pure ping sweep: it reports which hosts respond, without scanning any ports on them. Use this first against a whole subnet to figure out what's actually alive before scanning individual hosts.",
    customOverrides: {
      scanType: "sn",
    },
  },
  {
    id: "firewall-evasion",
    label: "Firewall Evasion Scan",
    description: "Fragmented packets, timing, decoys, and padding to slip past simple filtering.",
    category: "common-scenarios",
    fixedFlags: ["-f", "-T2", "-D", "RND:10", "--data-length", "24"],
    notes:
      "-f fragments packets to get past simple packet-filtering firewalls/IDS. -T2 (polite timing) further reduces rate-based detection. -D RND:10 adds 10 random decoy source IPs so your real IP doesn't stand out in the logs. --data-length 24 pads packets with random data to break signature-based detection of nmap's default packet size. This still won't get past a properly configured stateful firewall or modern IDS, treat it as a starting point, not a guarantee.",
    customOverrides: {
      evasionSpoofing: { fragmentPackets: true, decoyCount: 10, dataLength: 24 },
      timingPerformance: { timingTemplate: 2 },
    },
  },
  {
    id: "internet-scale-sweep",
    label: "Internet-Scale Fast Sweep",
    description: "High packet rate and host batching for scanning huge CIDR ranges or long host lists.",
    category: "payloadify-advanced",
    fixedFlags: ["-sS", "-Pn", "-n", "--min-hostgroup", "4096", "--min-rate", "10000", "--max-retries", "1", "-T4"],
    notes:
      "--min-hostgroup 4096 lets nmap batch a very large number of hosts together instead of stalling on a handful of slow ones, matching the kind of internet-scale scanning recipe used for bug bounty and attack-surface-management style recon. --min-rate 10000 sets a packet-rate floor so overall throughput stays high across the whole range. -Pn skips host discovery, since ICMP is unreliable and often filtered at this scale anyway, and -n skips reverse DNS lookups which would otherwise become a bottleneck across thousands of hosts. --max-retries 1 accepts more missed or ambiguous ports in exchange for speed. -T4 keeps per-probe timeouts aggressive. This trades completeness for throughput, treat it as a first pass and re-verify anything interesting with a slower scan.",
    customOverrides: {
      scanType: "sS",
      hostDiscovery: { noPing: true },
      dns: { neverResolve: true },
      timingPerformance: { minHostgroup: 4096, minRate: 10000, maxRetries: 1, timingTemplate: 4 },
    },
  },
  {
    id: "high-latency-link-scan",
    label: "High-Latency Link Scan",
    description: "Widened RTT timeouts for scanning over WAN, VPN, or satellite links where -T4/-T5 backfire.",
    category: "payloadify-advanced",
    fixedFlags: ["-sS", "--initial-rtt-timeout", "300ms", "--max-rtt-timeout", "4000ms", "--max-retries", "3", "-T2"],
    notes:
      "-T4 and -T5 can backfire on lossy or high-latency links (VPNs, satellite, congested WANs): their tight RTT assumptions trigger nmap's congestion control and cause retransmission storms instead of a faster scan. This template stays at -T2 for lower probe concurrency and widens --initial-rtt-timeout to 300ms and --max-rtt-timeout to 4000ms so a genuinely slow but alive host isn't mistaken for a dead one. --max-retries 3 keeps a moderate retry budget, more than an aggressive template would use, but well under nmap's own default of 10 retransmissions, which would be far too slow on a link like this.",
    customOverrides: {
      scanType: "sS",
      timingPerformance: { initialRttTimeout: "300ms", maxRttTimeout: "4000ms", maxRetries: 3, timingTemplate: 2 },
    },
  },
  {
    id: "rate-limited-accuracy-scan",
    label: "Rate-Limited Target Accuracy Scan",
    description: "Pushes through RST rate limiting on firewalls and load balancers instead of misreporting ports as filtered.",
    category: "payloadify-advanced",
    fixedFlags: ["-sS", "--defeat-rst-ratelimit", "--max-retries", "3", "-T3"],
    notes:
      "Some firewalls and load balancers rate-limit how many RST responses they send back, which makes nmap under-count responses and misreport genuinely closed ports as filtered. --defeat-rst-ratelimit pushes through that limiting so results come back accurate rather than ambiguous, this is a correctness fix for rate-limited targets, not an evasion technique. --max-retries 3 gives the scan a couple of extra attempts to get a clean response, and -T3 (nmap's own default timing) is kept rather than sped up, since the goal here is accuracy, not raw speed.",
    customOverrides: {
      scanType: "sS",
      timingPerformance: { defeatRstRatelimit: true, maxRetries: 3, timingTemplate: 3 },
    },
  },
  {
    id: "large-host-list-batch-scan",
    label: "Large Host-List Batch Scan",
    description: "Host-group batching and parallelism tuning for scanning thousands of hosts from a list.",
    category: "payloadify-advanced",
    fixedFlags: ["-sS", "-Pn", "--min-hostgroup", "64", "--max-hostgroup", "256", "--min-parallelism", "100", "-T4"],
    notes:
      "A distinct concern from raw packet rate: when scanning a large list or file of hosts, --min-hostgroup 64 and --max-hostgroup 256 control how many hosts nmap batches into a single group at once, so the scan moves on efficiently instead of stalling on whichever host in the batch responds slowest. --min-parallelism 100 keeps probe-level parallelism high within each batch. -Pn skips host discovery, which is often unnecessary overhead when scanning a pre-vetted host list. -T4 for speed given the extra parallelism already at play.",
    customOverrides: {
      scanType: "sS",
      hostDiscovery: { noPing: true },
      timingPerformance: { minHostgroup: 64, maxHostgroup: 256, minParallelism: 100, timingTemplate: 4 },
    },
  },
  {
    id: "high-confidence-verification-scan",
    label: "High-Confidence Verification Scan",
    description: "Slow, low-false-negative re-scan pass to confirm results before finalizing a report.",
    category: "payloadify-advanced",
    fixedFlags: ["-sS", "-Pn", "--max-retries", "6", "--initial-rtt-timeout", "500ms", "--max-rtt-timeout", "10000ms", "--host-timeout", "30m", "-T2"],
    notes:
      "A slower, deliberately thorough re-scan pass meant to confirm results before they go in a report, the opposite goal of the speed-focused templates above. --max-retries 6 gives nmap more chances to get a clean response than an aggressive scan would allow, and --initial-rtt-timeout 500ms with --max-rtt-timeout 10000ms (nmap's own default max) gives slow or borderline hosts room to respond rather than being timed out early. --host-timeout 30m still gives up on a truly unresponsive host eventually rather than hanging forever. -Pn skips host discovery since these hosts were already confirmed alive in an earlier pass, and -T2 keeps the whole pass conservative and low-impact.",
    customOverrides: {
      scanType: "sS",
      hostDiscovery: { noPing: true },
      timingPerformance: { maxRetries: 6, initialRttTimeout: "500ms", maxRttTimeout: "10000ms", hostTimeout: "30m", timingTemplate: 2 },
    },
  },
];

export const NMAP_TEMPLATES_BY_ID: Record<string, NmapTemplate> = Object.fromEntries(
  NMAP_TEMPLATES.map((t) => [t.id, t]),
);

/** Which template is pre-selected when a first-time visitor lands on the page. Not shown in the
 *  UI as an endorsement of any kind, just a starting point. */
export const DEFAULT_TEMPLATE_ID = "fast-scan";
