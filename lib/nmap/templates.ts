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
}

/** Every flag below is drawn only from the confirmed Nmap-Cheatsheet reference this tool was
 *  built against (github.com/jasonniebauer/Nmap-Cheatsheet). Nothing here is an invented flag
 *  or an assumed-but-unverified combination. */
export const NMAP_TEMPLATES: NmapTemplate[] = [
  {
    id: "fast-scan",
    label: "Fast Scan",
    description: "Quick look at the top 100 ports.",
    fixedFlags: ["-F", "-T4"],
    notes:
      "-F scans only the top 100 most common ports (the reference's own documented fast-scan example), -T4 keeps it quick. Best first pass on a host you don't know anything about yet.",
  },
  {
    id: "stealth-scan",
    label: "Stealth Scan",
    description: "Quieter SYN scan, avoids completing the TCP handshake.",
    fixedFlags: ["-sS", "-T2", "-Pn"],
    notes:
      "-sS (SYN scan) never completes the TCP handshake, so it's less likely to be logged at the application layer. -T2 (polite timing) spaces packets out to reduce IDS/rate-based detection. -Pn skips the host-discovery ping, since a ping probe is itself often blocked or logged and would defeat the point of trying to be quiet.",
  },
  {
    id: "full-port-scan",
    label: "Full Port Scan",
    description: "Every TCP port, 1 through 65535.",
    fixedFlags: ["-sS", "-p", "1-65535", "-T4"],
    notes:
      "-p 1-65535 scans every TCP port instead of nmap's default top-1000, -sS keeps the scan type defined and efficient, -T4 keeps a 65535-port scan tractable. Use this when a fast/aggressive scan might have missed a service on a non-standard port.",
  },
  {
    id: "aggressive-scan",
    label: "Aggressive Scan (Version + OS)",
    description: "OS detection, version detection, default scripts, and traceroute in one flag.",
    fixedFlags: ["-A", "-T4"],
    notes:
      "-A is nmap's own documented all-in-one flag: OS detection, service version detection, default NSE scripts, and traceroute. It does not scan more ports than nmap's default top-1000, it adds detection depth on the ports it does scan. -T4 for speed given the extra work -A already does.",
  },
  {
    id: "udp-scan",
    label: "UDP Scan",
    description: "Checks the top 100 UDP ports.",
    fixedFlags: ["-sU", "--top-ports", "100", "-T4"],
    notes:
      "-sU scans UDP instead of TCP, which many scanners skip entirely even though services like DNS/SNMP/DHCP live there. --top-ports 100 keeps it practical, since a full 65535-port UDP scan is notoriously slow. -T4 for speed.",
  },
  {
    id: "vuln-script-scan",
    label: "Vulnerability / Script Scan",
    description: "Runs NSE's default and vulnerability-focused scripts.",
    fixedFlags: ["-sV", "-sC", "--script", "vuln", "-T4"],
    notes:
      "-sV feeds version info to scripts that need it, -sC runs nmap's default script set, --script vuln adds the vuln NSE category on top. -T4 for speed. Use this after you already know which ports are open (e.g. from a Fast or Full Port Scan first).",
  },
  {
    id: "host-discovery",
    label: "Host Discovery / Ping Sweep",
    description: "Finds which hosts are alive, no port scan at all.",
    fixedFlags: ["-sn"],
    notes:
      "-sn is a pure ping sweep: it reports which hosts respond, without scanning any ports on them. Use this first against a whole subnet to figure out what's actually alive before scanning individual hosts.",
  },
  {
    id: "firewall-evasion",
    label: "Firewall Evasion Scan",
    description: "Fragmented packets, timing, decoys, and padding to slip past simple filtering.",
    fixedFlags: ["-f", "-T2", "-D", "RND:10", "--data-length", "24"],
    notes:
      "-f fragments packets to get past simple packet-filtering firewalls/IDS. -T2 (polite timing) further reduces rate-based detection. -D RND:10 adds 10 random decoy source IPs so your real IP doesn't stand out in the logs. --data-length 24 pads packets with random data to break signature-based detection of nmap's default packet size. This still won't get past a properly configured stateful firewall or modern IDS, treat it as a starting point, not a guarantee.",
  },
];

export const NMAP_TEMPLATES_BY_ID: Record<string, NmapTemplate> = Object.fromEntries(
  NMAP_TEMPLATES.map((t) => [t.id, t]),
);

/** Which template is pre-selected when a first-time visitor lands on the page. Not shown in the
 *  UI as an endorsement of any kind, just a starting point. */
export const DEFAULT_TEMPLATE_ID = "fast-scan";
