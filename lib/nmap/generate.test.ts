import { describe, expect, it } from "vitest";
import { buildCommand, detectTargetKind, splitTargetList } from "./generate";
import { NmapSelection } from "./params";
import { DEFAULT_TEMPLATE_ID, NMAP_TEMPLATES } from "./templates";

function baseSelection(overrides: Partial<NmapSelection> = {}): NmapSelection {
  return {
    mode: "custom",
    templateId: null,
    target: { value: "10.0.0.5" },
    exclude: { value: "" },
    output: { format: "none", path: "", statsEvery: "" },
    ipv6: false,
    scanType: "sS",
    zombieHost: "",
    portSpec: { mode: "default", topPortsN: null, customPorts: "", sequential: false },
    serviceOsDetection: {
      aggressive: false,
      versionDetection: false,
      versionTrace: false,
      osDetection: false,
      osScanGuess: false,
    },
    scriptScan: { defaultScripts: false, scriptExpression: "", scriptTrace: false, scriptUpdateDb: false },
    timingPerformance: {
      timingTemplate: null,
      ttl: null,
      minParallelism: null,
      maxParallelism: null,
      minHostgroup: null,
      maxHostgroup: null,
      initialRttTimeout: "",
      maxRttTimeout: "",
      maxRetries: null,
      hostTimeout: "",
      scanDelay: "",
      maxScanDelay: "",
      minRate: null,
      maxRate: null,
      defeatRstRatelimit: false,
    },
    evasionSpoofing: {
      fragmentPackets: false,
      mtu: null,
      decoyCount: null,
      sourcePort: null,
      dataLength: null,
      randomizeHosts: false,
      spoofMac: "",
      badsum: false,
    },
    hostDiscovery: { noPing: false, probes: {} },
    dns: { alwaysResolve: false, neverResolve: false, systemDns: false, dnsServers: "", traceroute: false },
    misc: { reason: false, openOnly: false, packetTrace: false, ifList: false, interfaceName: "", verbose: false, debug: false },
    ...overrides,
  };
}

describe("splitTargetList", () => {
  it("splits on commas and newlines, trimming and dropping empties", () => {
    expect(splitTargetList("host1, host2,host3\nhost4,,  ")).toEqual(["host1", "host2", "host3", "host4"]);
  });
});

describe("buildCommand — template mode", () => {
  it("builds the exact command for every template against a simple host target", () => {
    const expected: Record<string, string> = {
      "fast-scan": "nmap -F -T4 '192.168.1.1'",
      "stealth-scan": "nmap -sS -T2 -Pn '192.168.1.1'",
      "full-port-scan": "nmap -sS -p 1-65535 -T4 '192.168.1.1'",
      "aggressive-scan": "nmap -A -T4 '192.168.1.1'",
      "udp-scan": "nmap -sU --top-ports 100 -T4 '192.168.1.1'",
      "vuln-script-scan": "nmap -sV -sC --script vuln -T4 '192.168.1.1'",
      "host-discovery": "nmap -sn '192.168.1.1'",
      "firewall-evasion": "nmap -f -T2 -D RND:10 --data-length 24 '192.168.1.1'",
      "internet-scale-sweep": "nmap -sS -Pn -n --min-hostgroup 4096 --min-rate 10000 --max-retries 1 -T4 '192.168.1.1'",
      "high-latency-link-scan": "nmap -sS --initial-rtt-timeout 300ms --max-rtt-timeout 4000ms --max-retries 3 -T2 '192.168.1.1'",
      "rate-limited-accuracy-scan": "nmap -sS --defeat-rst-ratelimit --max-retries 3 -T3 '192.168.1.1'",
      "large-host-list-batch-scan": "nmap -sS -Pn --min-hostgroup 64 --max-hostgroup 256 --min-parallelism 100 -T4 '192.168.1.1'",
      "high-confidence-verification-scan":
        "nmap -sS -Pn --max-retries 6 --initial-rtt-timeout 500ms --max-rtt-timeout 10000ms --host-timeout 30m -T2 '192.168.1.1'",
    };

    for (const template of NMAP_TEMPLATES) {
      const sel = baseSelection({
        mode: "template",
        templateId: template.id,
        target: { value: "192.168.1.1" },
      });
      expect(buildCommand(sel)).toBe(expected[template.id]);
    }
  });

  it("has a default template that resolves to a real template", () => {
    expect(NMAP_TEMPLATES.some((t) => t.id === DEFAULT_TEMPLATE_ID)).toBe(true);
  });

  it("splices exclude and output flags after the fixed template flags", () => {
    const sel = baseSelection({
      mode: "template",
      templateId: "fast-scan",
      target: { value: "10.0.0.1" },
      exclude: { value: "10.0.0.2,10.0.0.3" },
      output: { format: "oN", path: "scan.txt", statsEvery: "" },
    });
    expect(buildCommand(sel)).toBe("nmap -F -T4 '10.0.0.1' --exclude '10.0.0.2,10.0.0.3' -oN 'scan.txt'");
  });

  it("renders --excludefile for a file-like exclude value", () => {
    const sel = baseSelection({
      mode: "template",
      templateId: "fast-scan",
      target: { value: "10.0.0.1" },
      exclude: { value: "exclude.txt" },
    });
    expect(buildCommand(sel)).toBe("nmap -F -T4 '10.0.0.1' --excludefile 'exclude.txt'");
  });

  it("omits any exclude flag when the exclude field is empty", () => {
    const sel = baseSelection({ mode: "template", templateId: "fast-scan", target: { value: "10.0.0.1" } });
    expect(buildCommand(sel)).toBe("nmap -F -T4 '10.0.0.1'");
  });
});

describe("detectTargetKind", () => {
  it("detects a plain IP as a host", () => {
    expect(detectTargetKind("10.0.0.5")).toBe("host");
  });

  it("detects a CIDR range as a host (same handling as a single IP)", () => {
    expect(detectTargetKind("10.0.0.0/24")).toBe("host");
  });

  it("detects a domain name as a host", () => {
    expect(detectTargetKind("scanme.example.com")).toBe("host");
  });

  it("detects a bare hostname with no dot or TLD as a host, not a file", () => {
    expect(detectTargetKind("dc01")).toBe("host");
  });

  it("detects a comma-separated single line as a list", () => {
    expect(detectTargetKind("10.0.0.1, 10.0.0.2")).toBe("list");
  });

  it("detects newline-separated targets as a list", () => {
    expect(detectTargetKind("10.0.0.1\n10.0.0.2")).toBe("list");
  });

  it("detects a .txt/.lst/.list/.csv path as a file", () => {
    expect(detectTargetKind("targets.txt")).toBe("file");
    expect(detectTargetKind("targets.lst")).toBe("file");
    expect(detectTargetKind("targets.list")).toBe("file");
    expect(detectTargetKind("targets.csv")).toBe("file");
  });

  it("a comma or newline takes priority over a file-like extension", () => {
    expect(detectTargetKind("host1.txt, host2.txt")).toBe("list");
  });
});

describe("buildCommand — target kinds", () => {
  it("renders a CIDR target quoted like a host target", () => {
    const sel = baseSelection({ mode: "template", templateId: "fast-scan", target: { value: "10.0.0.0/24" } });
    expect(buildCommand(sel)).toBe("nmap -F -T4 '10.0.0.0/24'");
  });

  it("renders a bare hostname with no TLD as a plain quoted target, not a file", () => {
    const sel = baseSelection({ mode: "template", templateId: "fast-scan", target: { value: "dc01" } });
    expect(buildCommand(sel)).toBe("nmap -F -T4 'dc01'");
  });

  it("renders a .txt file target as -iL with no trailing bare target", () => {
    const sel = baseSelection({ mode: "template", templateId: "fast-scan", target: { value: "targets.txt" } });
    expect(buildCommand(sel)).toBe("nmap -F -T4 -iL 'targets.txt'");
  });

  it("splits a comma-separated target list into multiple quoted positional args, not one comma-joined token", () => {
    const sel = baseSelection({
      mode: "template",
      templateId: "fast-scan",
      target: { value: "host1, host2,host3" },
    });
    expect(buildCommand(sel)).toBe("nmap -F -T4 'host1' 'host2' 'host3'");
  });

  it("splits a newline-separated target list the same way", () => {
    const sel = baseSelection({ mode: "template", templateId: "fast-scan", target: { value: "host1\nhost2" } });
    expect(buildCommand(sel)).toBe("nmap -F -T4 'host1' 'host2'");
  });

  it("escapes an embedded single quote in a target instead of breaking out of the quoting", () => {
    const sel = baseSelection({
      mode: "template",
      templateId: "fast-scan",
      target: { value: "abc' ; touch pwned #" },
    });
    expect(buildCommand(sel)).toBe("nmap -F -T4 'abc'\\'' ; touch pwned #'");
  });
});

describe("buildCommand — custom mode scan types", () => {
  it("builds a bare scan-type flag for every non-idle scan type", () => {
    const types: NmapSelection["scanType"][] = ["sS", "sT", "sU", "sN", "sF", "sX", "sA", "sO", "sL", "sW", "sn"];
    for (const scanType of types) {
      const sel = baseSelection({ scanType });
      expect(buildCommand(sel)).toBe(`nmap -${scanType} '10.0.0.5'`);
    }
  });

  it("builds -sI with a quoted zombie host argument", () => {
    const sel = baseSelection({ scanType: "sI", zombieHost: "zombie.local" });
    expect(buildCommand(sel)).toBe("nmap -sI 'zombie.local' '10.0.0.5'");
  });
});

describe("buildCommand — custom mode port spec", () => {
  it("omits any port flag for mode 'default'", () => {
    expect(buildCommand(baseSelection())).toBe("nmap -sS '10.0.0.5'");
  });

  it("renders -F for mode 'fast'", () => {
    const sel = baseSelection({ portSpec: { mode: "fast", topPortsN: null, customPorts: "", sequential: false } });
    expect(buildCommand(sel)).toBe("nmap -sS -F '10.0.0.5'");
  });

  it("renders -p 1-65535 for mode 'all'", () => {
    const sel = baseSelection({ portSpec: { mode: "all", topPortsN: null, customPorts: "", sequential: false } });
    expect(buildCommand(sel)).toBe("nmap -sS -p 1-65535 '10.0.0.5'");
  });

  it("renders --top-ports N for mode 'top'", () => {
    const sel = baseSelection({ portSpec: { mode: "top", topPortsN: 200, customPorts: "", sequential: false } });
    expect(buildCommand(sel)).toBe("nmap -sS --top-ports 200 '10.0.0.5'");
  });

  it("renders quoted -p for mode 'custom' and appends -r when sequential", () => {
    const sel = baseSelection({ portSpec: { mode: "custom", topPortsN: null, customPorts: "22,80,443", sequential: true } });
    expect(buildCommand(sel)).toBe("nmap -sS -p '22,80,443' -r '10.0.0.5'");
  });

  it("skips port flags entirely for -sn even if a non-default port spec is set (defensive backstop)", () => {
    const sel = baseSelection({
      scanType: "sn",
      portSpec: { mode: "all", topPortsN: null, customPorts: "", sequential: false },
    });
    expect(buildCommand(sel)).toBe("nmap -sn '10.0.0.5'");
  });
});

describe("buildCommand — service/OS detection", () => {
  it("renders -sV and -O independently with their sub-flags", () => {
    const sel = baseSelection({
      serviceOsDetection: {
        aggressive: false,
        versionDetection: true,
        versionTrace: true,
        osDetection: true,
        osScanGuess: true,
      },
    });
    expect(buildCommand(sel)).toBe("nmap -sS -sV --version-trace -O --osscan-guess '10.0.0.5'");
  });

  it("suppresses -sV/-O/-sC/--traceroute when aggressive is set, even if also individually true", () => {
    const sel = baseSelection({
      serviceOsDetection: { aggressive: true, versionDetection: true, versionTrace: true, osDetection: true, osScanGuess: true },
      scriptScan: { defaultScripts: true, scriptExpression: "", scriptTrace: false, scriptUpdateDb: false },
      dns: { alwaysResolve: false, neverResolve: false, systemDns: false, dnsServers: "", traceroute: true },
    });
    expect(buildCommand(sel)).toBe("nmap -sS -A '10.0.0.5'");
  });
});

describe("buildCommand — script scanning", () => {
  it("renders -sC and a quoted --script expression together", () => {
    const sel = baseSelection({
      scriptScan: { defaultScripts: true, scriptExpression: "vuln,safe", scriptTrace: true, scriptUpdateDb: true },
    });
    expect(buildCommand(sel)).toBe("nmap -sS -sC --script 'vuln,safe' --script-trace --script-updatedb '10.0.0.5'");
  });
});

describe("buildCommand — host discovery probes", () => {
  it("renders -Pn and ignores probes when set", () => {
    const sel = baseSelection({ hostDiscovery: { noPing: true, probes: { PS: "22" } } });
    expect(buildCommand(sel)).toBe("nmap -sS -Pn '10.0.0.5'");
  });

  it("renders selected probes in a fixed order, with and without a port argument", () => {
    const sel = baseSelection({ hostDiscovery: { noPing: false, probes: { PE: "", PS: "22,80,443" } } });
    expect(buildCommand(sel)).toBe("nmap -sS -PS22,80,443 -PE '10.0.0.5'");
  });
});

describe("buildCommand — timing, evasion, DNS, misc, and output", () => {
  it("renders a kitchen-sink custom selection in the documented canonical order", () => {
    const sel = baseSelection({
      scanType: "sS",
      hostDiscovery: { noPing: false, probes: { PE: "" } },
      portSpec: { mode: "top", topPortsN: 1000, customPorts: "", sequential: false },
      serviceOsDetection: { aggressive: false, versionDetection: true, versionTrace: false, osDetection: false, osScanGuess: false },
      scriptScan: { defaultScripts: true, scriptExpression: "", scriptTrace: false, scriptUpdateDb: false },
      timingPerformance: {
        timingTemplate: 4,
        ttl: 64,
        minParallelism: null,
        maxParallelism: null,
        minHostgroup: null,
        maxHostgroup: null,
        initialRttTimeout: "",
        maxRttTimeout: "",
        maxRetries: 2,
        hostTimeout: "",
        scanDelay: "",
        maxScanDelay: "",
        minRate: null,
        maxRate: null,
        defeatRstRatelimit: false,
      },
      evasionSpoofing: {
        fragmentPackets: true,
        mtu: null,
        decoyCount: 5,
        sourcePort: null,
        dataLength: null,
        randomizeHosts: true,
        spoofMac: "",
        badsum: false,
      },
      dns: { alwaysResolve: false, neverResolve: true, systemDns: false, dnsServers: "", traceroute: false },
      misc: { reason: true, openOnly: true, packetTrace: false, ifList: false, interfaceName: "eth0", verbose: true, debug: false },
      output: { format: "oA", path: "scan-results", statsEvery: "10s" },
    });
    expect(buildCommand(sel)).toBe(
      "nmap -sS -PE --top-ports 1000 -sV -sC -T4 --ttl 64 --max-retries 2 -f -D RND:5 --randomize-hosts -n --reason --open -e 'eth0' -v '10.0.0.5' -oA 'scan-results' --stats-every '10s'",
    );
  });

  it("quotes an output path and DNS server list containing spaces", () => {
    const sel = baseSelection({
      output: { format: "oN", path: "my scan.txt", statsEvery: "" },
      dns: { alwaysResolve: false, neverResolve: false, systemDns: false, dnsServers: "8.8.8.8, 1.1.1.1", traceroute: false },
    });
    expect(buildCommand(sel)).toBe("nmap -sS --dns-servers '8.8.8.8, 1.1.1.1' '10.0.0.5' -oN 'my scan.txt'");
  });
});
