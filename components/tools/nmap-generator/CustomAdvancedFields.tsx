import { Tooltip } from "@/components/ui/Tooltip";
import { checkboxLabelClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { DnsOptions, EvasionSpoofing, MiscOptions, ScriptScan, ServiceOsDetection, TimingPerformance } from "@/lib/nmap/params";

export function CustomAdvancedFields({
  serviceOsDetection,
  onServiceOsDetectionChange,
  scriptScan,
  onScriptScanChange,
  timingPerformance,
  onTimingPerformanceChange,
  evasionSpoofing,
  onEvasionSpoofingChange,
  dns,
  onDnsChange,
  misc,
  onMiscChange,
  ipv6,
  onIpv6Change,
}: {
  serviceOsDetection: ServiceOsDetection;
  onServiceOsDetectionChange: (next: ServiceOsDetection) => void;
  scriptScan: ScriptScan;
  onScriptScanChange: (next: ScriptScan) => void;
  timingPerformance: TimingPerformance;
  onTimingPerformanceChange: (next: TimingPerformance) => void;
  evasionSpoofing: EvasionSpoofing;
  onEvasionSpoofingChange: (next: EvasionSpoofing) => void;
  dns: DnsOptions;
  onDnsChange: (next: DnsOptions) => void;
  misc: MiscOptions;
  onMiscChange: (next: MiscOptions) => void;
  ipv6: boolean;
  onIpv6Change: (value: boolean) => void;
}) {
  const numOrNull = (v: string) => (v === "" ? null : Number(v));

  return (
    <details className="rounded border border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">+ Advanced Options</summary>
      <div className="flex flex-col gap-4 px-3 pb-3">
        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Service &amp; OS Detection</p>
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              checked={serviceOsDetection.aggressive}
              onChange={(e) => onServiceOsDetectionChange({ ...serviceOsDetection, aggressive: e.target.checked })}
            />
            Aggressive (-A)
            <Tooltip text="Combines OS detection, version detection, default scripts, and traceroute in one flag. Overrides the individual toggles below." />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={serviceOsDetection.versionDetection}
                disabled={serviceOsDetection.aggressive}
                onChange={(e) => onServiceOsDetectionChange({ ...serviceOsDetection, versionDetection: e.target.checked })}
              />
              Version detection (-sV)
            </label>
            {serviceOsDetection.versionDetection && !serviceOsDetection.aggressive && (
              <label className={checkboxLabelClasses}>
                <input
                  type="checkbox"
                  checked={serviceOsDetection.versionTrace}
                  onChange={(e) => onServiceOsDetectionChange({ ...serviceOsDetection, versionTrace: e.target.checked })}
                />
                --version-trace
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={serviceOsDetection.osDetection}
                disabled={serviceOsDetection.aggressive}
                onChange={(e) => onServiceOsDetectionChange({ ...serviceOsDetection, osDetection: e.target.checked })}
              />
              OS detection (-O)
            </label>
            {serviceOsDetection.osDetection && !serviceOsDetection.aggressive && (
              <label className={checkboxLabelClasses}>
                <input
                  type="checkbox"
                  checked={serviceOsDetection.osScanGuess}
                  onChange={(e) => onServiceOsDetectionChange({ ...serviceOsDetection, osScanGuess: e.target.checked })}
                />
                --osscan-guess
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">NSE Script Scanning</p>
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              checked={scriptScan.defaultScripts}
              disabled={serviceOsDetection.aggressive}
              onChange={(e) => onScriptScanChange({ ...scriptScan, defaultScripts: e.target.checked })}
            />
            Default scripts (-sC)
          </label>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Script expression (--script)
              <Tooltip text="A script name, expression, category (e.g. vuln), or comma-separated categories." />
            </label>
            <input
              type="text"
              value={scriptScan.scriptExpression}
              onChange={(e) => onScriptScanChange({ ...scriptScan, scriptExpression: e.target.value })}
              placeholder="vuln"
              className={`${inputClasses} font-mono`}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={scriptScan.scriptTrace}
                onChange={(e) => onScriptScanChange({ ...scriptScan, scriptTrace: e.target.checked })}
              />
              --script-trace
            </label>
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={scriptScan.scriptUpdateDb}
                onChange={(e) => onScriptScanChange({ ...scriptScan, scriptUpdateDb: e.target.checked })}
              />
              --script-updatedb
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Timing &amp; Performance</p>
          <div>
            <label className="mb-1 block text-sm font-medium">Timing template</label>
            <div className="flex flex-wrap gap-1">
              {([0, 1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onTimingPerformanceChange({ ...timingPerformance, timingTemplate: n })}
                  className={toggleButtonClasses(timingPerformance.timingTemplate === n)}
                >
                  -T{n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onTimingPerformanceChange({ ...timingPerformance, timingTemplate: null })}
                className={toggleButtonClasses(timingPerformance.timingTemplate === null)}
              >
                Default
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">TTL (--ttl)</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.ttl ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, ttl: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max retries (--max-retries)</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.maxRetries ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, maxRetries: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Min parallelism</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.minParallelism ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, minParallelism: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max parallelism</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.maxParallelism ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, maxParallelism: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Min host group</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.minHostgroup ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, minHostgroup: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max host group</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.maxHostgroup ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, maxHostgroup: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Min rate (pkts/s)</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.minRate ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, minRate: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max rate (pkts/s)</label>
              <input
                type="number"
                min={0}
                value={timingPerformance.maxRate ?? ""}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, maxRate: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Initial RTT timeout</label>
              <input
                type="text"
                value={timingPerformance.initialRttTimeout}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, initialRttTimeout: e.target.value })}
                placeholder="100ms"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max RTT timeout</label>
              <input
                type="text"
                value={timingPerformance.maxRttTimeout}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, maxRttTimeout: e.target.value })}
                placeholder="1s"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Host timeout</label>
              <input
                type="text"
                value={timingPerformance.hostTimeout}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, hostTimeout: e.target.value })}
                placeholder="30m"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Scan delay</label>
              <input
                type="text"
                value={timingPerformance.scanDelay}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, scanDelay: e.target.value })}
                placeholder="1s"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max scan delay</label>
              <input
                type="text"
                value={timingPerformance.maxScanDelay}
                onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, maxScanDelay: e.target.value })}
                placeholder="10s"
                className={inputClasses}
              />
            </div>
          </div>
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              checked={timingPerformance.defeatRstRatelimit}
              onChange={(e) => onTimingPerformanceChange({ ...timingPerformance, defeatRstRatelimit: e.target.checked })}
            />
            --defeat-rst-ratelimit
          </label>
        </div>

        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Evasion &amp; Spoofing</p>
          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={evasionSpoofing.fragmentPackets}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, fragmentPackets: e.target.checked })}
              />
              Fragment packets (-f)
            </label>
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={evasionSpoofing.randomizeHosts}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, randomizeHosts: e.target.checked })}
              />
              --randomize-hosts
            </label>
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={evasionSpoofing.badsum}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, badsum: e.target.checked })}
              />
              --badsum
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">MTU (--mtu)</label>
              <input
                type="number"
                min={0}
                value={evasionSpoofing.mtu ?? ""}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, mtu: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Decoy count
                <Tooltip text="Renders -D RND:<n>, n random decoy source IPs alongside your real scan." />
              </label>
              <input
                type="number"
                min={0}
                value={evasionSpoofing.decoyCount ?? ""}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, decoyCount: numOrNull(e.target.value) })}
                placeholder="10"
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Source port (--source-port)</label>
              <input
                type="number"
                min={0}
                max={65535}
                value={evasionSpoofing.sourcePort ?? ""}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, sourcePort: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Data length (--data-length)</label>
              <input
                type="number"
                min={0}
                value={evasionSpoofing.dataLength ?? ""}
                onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, dataLength: numOrNull(e.target.value) })}
                className={`${selectClasses} w-full`}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Spoof MAC (--spoof-mac)</label>
            <input
              type="text"
              value={evasionSpoofing.spoofMac}
              onChange={(e) => onEvasionSpoofingChange({ ...evasionSpoofing, spoofMac: e.target.value })}
              placeholder="0, a vendor name, or a literal MAC"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">DNS Resolution</p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onDnsChange({ ...dns, alwaysResolve: false, neverResolve: false })}
              className={toggleButtonClasses(!dns.alwaysResolve && !dns.neverResolve)}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => onDnsChange({ ...dns, alwaysResolve: true, neverResolve: false })}
              className={toggleButtonClasses(dns.alwaysResolve)}
            >
              Always resolve (-R)
            </button>
            <button
              type="button"
              onClick={() => onDnsChange({ ...dns, alwaysResolve: false, neverResolve: true })}
              className={toggleButtonClasses(dns.neverResolve)}
            >
              Never resolve (-n)
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={dns.systemDns} onChange={(e) => onDnsChange({ ...dns, systemDns: e.target.checked })} />
              --system-dns
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={dns.traceroute} onChange={(e) => onDnsChange({ ...dns, traceroute: e.target.checked })} />
              --traceroute
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">DNS servers (--dns-servers)</label>
            <input
              type="text"
              value={dns.dnsServers}
              onChange={(e) => onDnsChange({ ...dns, dnsServers: e.target.value })}
              placeholder="8.8.8.8, 1.1.1.1"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Troubleshooting &amp; Misc</p>
          <label className={checkboxLabelClasses}>
            <input type="checkbox" checked={ipv6} onChange={(e) => onIpv6Change(e.target.checked)} />
            IPv6 targets (-6)
          </label>
          <div className="flex flex-wrap gap-4">
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={misc.reason} onChange={(e) => onMiscChange({ ...misc, reason: e.target.checked })} />
              --reason
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={misc.openOnly} onChange={(e) => onMiscChange({ ...misc, openOnly: e.target.checked })} />
              --open
            </label>
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={misc.packetTrace}
                onChange={(e) => onMiscChange({ ...misc, packetTrace: e.target.checked })}
              />
              --packet-trace
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={misc.ifList} onChange={(e) => onMiscChange({ ...misc, ifList: e.target.checked })} />
              --iflist
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={misc.verbose} onChange={(e) => onMiscChange({ ...misc, verbose: e.target.checked })} />
              -v
            </label>
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={misc.debug} onChange={(e) => onMiscChange({ ...misc, debug: e.target.checked })} />
              -d
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Interface (-e)</label>
            <input
              type="text"
              value={misc.interfaceName}
              onChange={(e) => onMiscChange({ ...misc, interfaceName: e.target.value })}
              placeholder="eth0"
              className={inputClasses}
            />
          </div>
        </div>
      </div>
    </details>
  );
}
