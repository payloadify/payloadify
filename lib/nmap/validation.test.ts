import { describe, expect, it } from "vitest";
import { validateSelection } from "./validation";
import { NmapSelection } from "./params";

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

describe("validateSelection — target", () => {
  it("passes for a valid host target", () => {
    expect(validateSelection(baseSelection()).ok).toBe(true);
  });

  it("fails for an empty target", () => {
    expect(validateSelection(baseSelection({ target: { value: "  " } })).ok).toBe(false);
  });

  it("passes for a bare hostname with no TLD", () => {
    expect(validateSelection(baseSelection({ target: { value: "dc01" } })).ok).toBe(true);
  });

  it("passes for a CIDR range", () => {
    expect(validateSelection(baseSelection({ target: { value: "10.0.0.0/24" } })).ok).toBe(true);
  });

  it("fails for a list target with only blank entries", () => {
    expect(validateSelection(baseSelection({ target: { value: " , ,\n" } })).ok).toBe(false);
  });

  it("passes for a list target with at least one entry", () => {
    expect(validateSelection(baseSelection({ target: { value: "host1, ," } })).ok).toBe(true);
  });

  it("passes for a file-like target (.txt)", () => {
    expect(validateSelection(baseSelection({ target: { value: "targets.txt" } })).ok).toBe(true);
  });
});

describe("validateSelection — template mode", () => {
  it("fails when no template is selected", () => {
    expect(validateSelection(baseSelection({ mode: "template", templateId: null })).ok).toBe(false);
  });

  it("fails for an unknown template id", () => {
    expect(validateSelection(baseSelection({ mode: "template", templateId: "not-real" })).ok).toBe(false);
  });

  it("passes for a known template id", () => {
    expect(validateSelection(baseSelection({ mode: "template", templateId: "fast-scan" })).ok).toBe(true);
  });
});

describe("validateSelection — custom mode rules", () => {
  it("fails for -sI with no zombie host", () => {
    expect(validateSelection(baseSelection({ scanType: "sI", zombieHost: "" })).ok).toBe(false);
  });

  it("passes for -sI with a zombie host", () => {
    expect(validateSelection(baseSelection({ scanType: "sI", zombieHost: "zombie.local" })).ok).toBe(true);
  });

  it("fails when a non-default port spec is set on -sn", () => {
    const sel = baseSelection({
      scanType: "sn",
      portSpec: { mode: "fast", topPortsN: null, customPorts: "", sequential: false },
    });
    expect(validateSelection(sel).ok).toBe(false);
  });

  it("passes when port spec is default on -sn", () => {
    expect(validateSelection(baseSelection({ scanType: "sn" })).ok).toBe(true);
  });

  it("fails when port spec mode is 'top' with no topPortsN entered", () => {
    const sel = baseSelection({ portSpec: { mode: "top", topPortsN: null, customPorts: "", sequential: false } });
    expect(validateSelection(sel).ok).toBe(false);
  });

  it("passes when port spec mode is 'top' with topPortsN entered", () => {
    const sel = baseSelection({ portSpec: { mode: "top", topPortsN: 200, customPorts: "", sequential: false } });
    expect(validateSelection(sel).ok).toBe(true);
  });

  it("fails when port spec mode is 'custom' with a blank port list", () => {
    const sel = baseSelection({ portSpec: { mode: "custom", topPortsN: null, customPorts: "  ", sequential: false } });
    expect(validateSelection(sel).ok).toBe(false);
  });

  it("passes when port spec mode is 'custom' with a non-blank port list", () => {
    const sel = baseSelection({ portSpec: { mode: "custom", topPortsN: null, customPorts: "22,80,443", sequential: false } });
    expect(validateSelection(sel).ok).toBe(true);
  });

  it("fails when both -R and -n are set", () => {
    const sel = baseSelection({ dns: { alwaysResolve: true, neverResolve: true, systemDns: false, dnsServers: "", traceroute: false } });
    expect(validateSelection(sel).ok).toBe(false);
  });

  it("fails when -Pn is set alongside a selected probe", () => {
    const sel = baseSelection({ hostDiscovery: { noPing: true, probes: { PS: "" } } });
    expect(validateSelection(sel).ok).toBe(false);
  });

  it("passes when -Pn is set with no probes selected", () => {
    expect(validateSelection(baseSelection({ hostDiscovery: { noPing: true, probes: {} } })).ok).toBe(true);
  });
});

describe("validateSelection — shared output/exclude rules", () => {
  it("fails when an output format is picked with no path", () => {
    expect(validateSelection(baseSelection({ output: { format: "oN", path: "", statsEvery: "" } })).ok).toBe(false);
  });

  it("passes when an output format is picked with a path", () => {
    expect(validateSelection(baseSelection({ output: { format: "oN", path: "scan.txt", statsEvery: "" } })).ok).toBe(true);
  });

  it("passes with an empty exclude value (exclude is fully optional)", () => {
    expect(validateSelection(baseSelection({ exclude: { value: "" } })).ok).toBe(true);
  });

  it("passes with a non-empty exclude value", () => {
    expect(validateSelection(baseSelection({ exclude: { value: "10.0.0.9" } })).ok).toBe(true);
  });
});
