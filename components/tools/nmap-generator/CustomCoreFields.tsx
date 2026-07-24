import { Tooltip } from "@/components/ui/Tooltip";
import { checkboxLabelClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CustomScanTypeId, HostDiscovery, PingProbeId, PortSpec } from "@/lib/nmap/params";

const SCAN_TYPES: { id: CustomScanTypeId; name: string; description: string }[] = [
  { id: "sS", name: "SYN", description: "Default and most popular: fast, doesn't complete the TCP handshake." },
  { id: "sT", name: "Connect", description: "Full TCP handshake. Works without raw-socket privileges." },
  { id: "sU", name: "UDP", description: "Scans UDP ports (DNS, SNMP, DHCP, and more)." },
  { id: "sN", name: "NULL", description: "No flags set. Can slip past some simple stateless firewalls." },
  { id: "sF", name: "FIN", description: "FIN flag only. Same evasion idea as NULL/Xmas." },
  { id: "sX", name: "Xmas", description: "FIN, PSH, and URG flags set." },
  { id: "sA", name: "ACK", description: "Maps firewall rule sets. Doesn't determine open vs. closed." },
  { id: "sO", name: "IP Protocol", description: "Discovers which IP protocols (TCP, UDP, ICMP...) are supported." },
  { id: "sL", name: "List", description: "Lists targets to scan without sending any packets at all." },
  { id: "sI", name: "Idle/Zombie", description: "Spoofs the scan through a third-party zombie host." },
  { id: "sW", name: "Window", description: "Like ACK scan, but also examines the TCP window field." },
  { id: "sn", name: "Ping Only", description: "Host discovery only. No port scan at all." },
];

const PING_PROBES: { id: PingProbeId; label: string }[] = [
  { id: "PS", label: "TCP SYN ping" },
  { id: "PA", label: "TCP ACK ping" },
  { id: "PU", label: "UDP ping" },
  { id: "PY", label: "SCTP INIT ping" },
  { id: "PE", label: "ICMP echo ping" },
  { id: "PP", label: "ICMP timestamp ping" },
  { id: "PM", label: "ICMP address mask ping" },
  { id: "PO", label: "IP protocol ping" },
  { id: "PR", label: "ARP ping" },
];

export function CustomCoreFields({
  scanType,
  onScanTypeChange,
  zombieHost,
  onZombieHostChange,
  portSpec,
  onPortSpecChange,
  hostDiscovery,
  onHostDiscoveryChange,
}: {
  scanType: CustomScanTypeId;
  onScanTypeChange: (id: CustomScanTypeId) => void;
  zombieHost: string;
  onZombieHostChange: (value: string) => void;
  portSpec: PortSpec;
  onPortSpecChange: (next: PortSpec) => void;
  hostDiscovery: HostDiscovery;
  onHostDiscoveryChange: (next: HostDiscovery) => void;
}) {
  const activeScanType = SCAN_TYPES.find((s) => s.id === scanType);
  const portsApply = scanType !== "sn" && scanType !== "sL";

  function toggleProbe(id: PingProbeId) {
    const nextProbes = { ...hostDiscovery.probes };
    if (id in nextProbes) delete nextProbes[id];
    else nextProbes[id] = "";
    onHostDiscoveryChange({ ...hostDiscovery, probes: nextProbes });
  }

  function setProbeArg(id: PingProbeId, value: string) {
    onHostDiscoveryChange({ ...hostDiscovery, probes: { ...hostDiscovery.probes, [id]: value } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Scan type</label>
        <div className="flex flex-wrap gap-1">
          {SCAN_TYPES.map((s) => (
            <button key={s.id} type="button" onClick={() => onScanTypeChange(s.id)} className={toggleButtonClasses(scanType === s.id)}>
              -{s.id}
            </button>
          ))}
        </div>
        {activeScanType && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{activeScanType.description}</p>}
      </div>

      {scanType === "sI" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Zombie host (-sI)</label>
          <input
            type="text"
            value={zombieHost}
            onChange={(e) => onZombieHostChange(e.target.value)}
            placeholder="zombie.example.com"
            className={inputClasses}
          />
        </div>
      )}

      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Port specification
          {!portsApply && <Tooltip text="This scan type doesn't touch ports, so port options don't apply." />}
        </label>
        <div className="mb-2 flex flex-wrap gap-1">
          {(["default", "fast", "top", "all", "custom"] as PortSpec["mode"][]).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={!portsApply}
              onClick={() => onPortSpecChange({ ...portSpec, mode })}
              className={`${toggleButtonClasses(portSpec.mode === mode)} disabled:opacity-30`}
            >
              {mode === "default" ? "Default" : mode === "fast" ? "Fast (-F)" : mode === "top" ? "Top N" : mode === "all" ? "All 65535" : "Custom"}
            </button>
          ))}
        </div>
        {portsApply && portSpec.mode === "top" && (
          <input
            type="number"
            min={1}
            max={65535}
            value={portSpec.topPortsN ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                onPortSpecChange({ ...portSpec, topPortsN: null });
                return;
              }
              const n = Number(v);
              onPortSpecChange({ ...portSpec, topPortsN: Number.isNaN(n) ? null : Math.min(65535, Math.max(1, n)) });
            }}
            placeholder="100"
            className={`${selectClasses} w-full`}
          />
        )}
        {portsApply && portSpec.mode === "custom" && (
          <input
            type="text"
            value={portSpec.customPorts}
            onChange={(e) => onPortSpecChange({ ...portSpec, customPorts: e.target.value })}
            placeholder="22,80,443 or http,https"
            className={`${inputClasses} font-mono`}
          />
        )}
        {portsApply && (
          <label className={`${checkboxLabelClasses} mt-2`}>
            <input
              type="checkbox"
              checked={portSpec.sequential}
              onChange={(e) => onPortSpecChange({ ...portSpec, sequential: e.target.checked })}
            />
            Scan ports sequentially (-r)
          </label>
        )}
      </div>

      <div>
        <label className={checkboxLabelClasses}>
          <input
            type="checkbox"
            checked={hostDiscovery.noPing}
            onChange={(e) => onHostDiscoveryChange({ ...hostDiscovery, noPing: e.target.checked })}
          />
          Skip host discovery (-Pn)
        </label>
        <p className="mb-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Treats every target as online. Useful when hosts don&apos;t respond to ping probes.
        </p>
        <div className="flex flex-col gap-2">
          {PING_PROBES.map((probe) => {
            const selected = probe.id in hostDiscovery.probes;
            return (
              <div key={probe.id} className="flex flex-wrap items-center gap-2">
                <label className={checkboxLabelClasses}>
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={hostDiscovery.noPing}
                    onChange={() => toggleProbe(probe.id)}
                  />
                  -{probe.id} ({probe.label})
                </label>
                {selected && !hostDiscovery.noPing && (
                  <input
                    type="text"
                    value={hostDiscovery.probes[probe.id] ?? ""}
                    onChange={(e) => setProbeArg(probe.id, e.target.value)}
                    placeholder="optional ports, e.g. 22,80,443"
                    className={`${inputClasses} max-w-[220px]`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
