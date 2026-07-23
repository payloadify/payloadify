"use client";

import { useMemo, useState } from "react";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { Callout } from "@/components/ui/Callout";
import { CommandBlock } from "@/components/ui/CommandBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import { toggleButtonClasses } from "@/components/ui/formClasses";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { buildCommand } from "@/lib/nmap/generate";
import {
  CustomScanTypeId,
  DnsOptions,
  EvasionSpoofing,
  HostDiscovery,
  MiscOptions,
  NmapExclude,
  NmapMode,
  NmapOutput,
  NmapSelection,
  NmapTarget,
  PortSpec,
  ScriptScan,
  ServiceOsDetection,
  TimingPerformance,
} from "@/lib/nmap/params";
import { DEFAULT_TEMPLATE_ID } from "@/lib/nmap/templates";
import { validateSelection } from "@/lib/nmap/validation";
import { CustomAdvancedFields } from "./CustomAdvancedFields";
import { CustomCoreFields } from "./CustomCoreFields";
import { TargetExcludeOutputFields } from "./TargetExcludeOutputFields";
import { TemplateFields } from "./TemplateFields";

const HISTORY_KEY = "payloadify:nmap-generator:history";

const DEFAULT_TARGET: NmapTarget = { value: "" };
const DEFAULT_EXCLUDE: NmapExclude = { value: "" };
const DEFAULT_OUTPUT: NmapOutput = { format: "none", path: "", statsEvery: "" };
const DEFAULT_PORT_SPEC: PortSpec = { mode: "default", topPortsN: null, customPorts: "", sequential: false };
const DEFAULT_SERVICE_OS: ServiceOsDetection = {
  aggressive: false,
  versionDetection: false,
  versionTrace: false,
  osDetection: false,
  osScanGuess: false,
};
const DEFAULT_SCRIPT_SCAN: ScriptScan = { defaultScripts: false, scriptExpression: "", scriptTrace: false, scriptUpdateDb: false };
const DEFAULT_TIMING: TimingPerformance = {
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
};
const DEFAULT_EVASION: EvasionSpoofing = {
  fragmentPackets: false,
  mtu: null,
  decoyCount: null,
  sourcePort: null,
  dataLength: null,
  randomizeHosts: false,
  spoofMac: "",
  badsum: false,
};
const DEFAULT_HOST_DISCOVERY: HostDiscovery = { noPing: false, probes: {} };
const DEFAULT_DNS: DnsOptions = { alwaysResolve: false, neverResolve: false, systemDns: false, dnsServers: "", traceroute: false };
const DEFAULT_MISC: MiscOptions = {
  reason: false,
  openOnly: false,
  packetTrace: false,
  ifList: false,
  interfaceName: "",
  verbose: false,
  debug: false,
};

export function NmapGeneratorTool() {
  const [builderMode, setBuilderMode] = useState<NmapMode>("template");
  const [templateId, setTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);

  const [target, setTarget] = useState<NmapTarget>(DEFAULT_TARGET);
  const [exclude, setExclude] = useState<NmapExclude>(DEFAULT_EXCLUDE);
  const [output, setOutput] = useState<NmapOutput>(DEFAULT_OUTPUT);
  const [ipv6, setIpv6] = useState(false);

  const [scanType, setScanType] = useState<CustomScanTypeId>("sS");
  const [zombieHost, setZombieHost] = useState("");
  const [portSpec, setPortSpec] = useState<PortSpec>(DEFAULT_PORT_SPEC);
  const [serviceOsDetection, setServiceOsDetection] = useState<ServiceOsDetection>(DEFAULT_SERVICE_OS);
  const [scriptScan, setScriptScan] = useState<ScriptScan>(DEFAULT_SCRIPT_SCAN);
  const [timingPerformance, setTimingPerformance] = useState<TimingPerformance>(DEFAULT_TIMING);
  const [evasionSpoofing, setEvasionSpoofing] = useState<EvasionSpoofing>(DEFAULT_EVASION);
  const [hostDiscovery, setHostDiscovery] = useState<HostDiscovery>(DEFAULT_HOST_DISCOVERY);
  const [dns, setDns] = useState<DnsOptions>(DEFAULT_DNS);
  const [misc, setMisc] = useState<MiscOptions>(DEFAULT_MISC);

  const [generatedSelection, setGeneratedSelection] = useState<NmapSelection | null>(null);
  const { blockedMsg, setBlockedMsg, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  const liveSelection: NmapSelection = {
    mode: builderMode,
    templateId: builderMode === "template" ? templateId : null,
    target,
    exclude,
    output,
    ipv6,
    scanType,
    zombieHost,
    portSpec,
    serviceOsDetection,
    scriptScan,
    timingPerformance,
    evasionSpoofing,
    hostDiscovery,
    dns,
    misc,
  };

  const validation = validateSelection(liveSelection);
  const canGenerateNow = validation.ok;

  function generate() {
    if (!canGenerateNow) return;
    const check = checkAndClear();
    if (!check.allowed) return;
    setGeneratedSelection(liveSelection);
    recordGeneration(check.now);
  }

  function resetAll() {
    setBuilderMode("template");
    setTemplateId(DEFAULT_TEMPLATE_ID);
    setTarget(DEFAULT_TARGET);
    setExclude(DEFAULT_EXCLUDE);
    setOutput(DEFAULT_OUTPUT);
    setIpv6(false);
    setScanType("sS");
    setZombieHost("");
    setPortSpec(DEFAULT_PORT_SPEC);
    setServiceOsDetection(DEFAULT_SERVICE_OS);
    setScriptScan(DEFAULT_SCRIPT_SCAN);
    setTimingPerformance(DEFAULT_TIMING);
    setEvasionSpoofing(DEFAULT_EVASION);
    setHostDiscovery(DEFAULT_HOST_DISCOVERY);
    setDns(DEFAULT_DNS);
    setMisc(DEFAULT_MISC);
    setGeneratedSelection(null);
    setBlockedMsg(null);
  }

  const generatedCommand = useMemo(() => (generatedSelection ? buildCommand(generatedSelection) : null), [generatedSelection]);

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <div>
        <label className="mb-1 block text-sm font-medium">Mode</label>
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setBuilderMode("template")} className={toggleButtonClasses(builderMode === "template")}>
            Scenario Templates
          </button>
          <button type="button" onClick={() => setBuilderMode("custom")} className={toggleButtonClasses(builderMode === "custom")}>
            Custom Build
          </button>
        </div>
      </div>

      {builderMode === "template" ? (
        <TemplateFields templateId={templateId} onTemplateChange={setTemplateId} />
      ) : (
        <>
          <CustomCoreFields
            scanType={scanType}
            onScanTypeChange={setScanType}
            zombieHost={zombieHost}
            onZombieHostChange={setZombieHost}
            portSpec={portSpec}
            onPortSpecChange={setPortSpec}
            hostDiscovery={hostDiscovery}
            onHostDiscoveryChange={setHostDiscovery}
          />
          <CustomAdvancedFields
            serviceOsDetection={serviceOsDetection}
            onServiceOsDetectionChange={setServiceOsDetection}
            scriptScan={scriptScan}
            onScriptScanChange={setScriptScan}
            timingPerformance={timingPerformance}
            onTimingPerformanceChange={setTimingPerformance}
            evasionSpoofing={evasionSpoofing}
            onEvasionSpoofingChange={setEvasionSpoofing}
            dns={dns}
            onDnsChange={setDns}
            misc={misc}
            onMiscChange={setMisc}
            ipv6={ipv6}
            onIpv6Change={setIpv6}
          />
        </>
      )}

      <TargetExcludeOutputFields
        target={target}
        onTargetChange={setTarget}
        exclude={exclude}
        onExcludeChange={setExclude}
        output={output}
        onOutputChange={setOutput}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={!canGenerateNow}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Generate Command
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>

      {!canGenerateNow && validation.message && target.value.length > 0 && <Callout variant="warning">{validation.message}</Callout>}

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!generatedCommand && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate Command.</Callout>}

      {generatedCommand && (
        <CommandBlock label="Command" command={generatedCommand} actions={<CopyButton text={generatedCommand} label="Copy Command" />} />
      )}
    </div>
  );
}
