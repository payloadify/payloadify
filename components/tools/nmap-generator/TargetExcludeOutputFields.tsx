import { Tooltip } from "@/components/ui/Tooltip";
import { inputClasses, selectClasses } from "@/components/ui/formClasses";
import { detectTargetKind, splitTargetList } from "@/lib/nmap/generate";
import { NmapExclude, NmapOutput, NmapOutputFormat, NmapTarget } from "@/lib/nmap/params";

const OUTPUT_FORMAT_LABELS: Record<NmapOutputFormat, string> = {
  none: "None",
  oN: "-oN (normal text)",
  oX: "-oX (XML)",
  oG: "-oG (grepable)",
  oS: "-oS (script kiddie)",
  oA: "-oA (all formats)",
};

/** Target/exclude/output stay editable in both Scenario Templates and Custom Build modes —
 *  everything else in a template is a fixed, non-editable flag set. */
export function TargetExcludeOutputFields({
  target,
  onTargetChange,
  exclude,
  onExcludeChange,
  output,
  onOutputChange,
}: {
  target: NmapTarget;
  onTargetChange: (next: NmapTarget) => void;
  exclude: NmapExclude;
  onExcludeChange: (next: NmapExclude) => void;
  output: NmapOutput;
  onOutputChange: (next: NmapOutput) => void;
}) {
  const detected = target.value.trim().length > 0 ? detectTargetKind(target.value) : null;
  const listCount = detected === "list" ? splitTargetList(target.value).length : 0;
  const excludeDetected = exclude.value.trim().length > 0 ? detectTargetKind(exclude.value) : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Target
          <Tooltip text="Type a single host, IP, or CIDR range; multiple hosts (comma or newline separated); or a file name (e.g. targets.txt) for -iL. Detected automatically from what you type." />
        </label>
        <textarea
          value={target.value}
          onChange={(e) => onTargetChange({ ...target, value: e.target.value })}
          placeholder={"10.0.0.5, scanme.example.com, or 192.168.1.0/24\nOne per line for multiple targets\ntargets.txt for a file list (-iL)"}
          rows={3}
          className={`${inputClasses} font-mono`}
        />
        {detected && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Detected:{" "}
            {detected === "file"
              ? "file list (-iL). This tool never reads your filesystem, enter the path you'll actually use on your own machine."
              : detected === "list"
                ? `host list (${listCount} target${listCount === 1 ? "" : "s"})`
                : "single host / IP / CIDR"}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Exclude targets
          <Tooltip text="Skip specific hosts even if they'd otherwise match your target above. Useful for keeping out-of-scope hosts out of an engagement. Optional, leave blank to skip. A file name (e.g. exclude.txt) becomes --excludefile." />
        </label>
        <input
          type="text"
          value={exclude.value}
          onChange={(e) => onExcludeChange({ ...exclude, value: e.target.value })}
          placeholder="10.0.0.1, 10.0.0.2, or exclude.txt"
          className={inputClasses}
        />
        {excludeDetected && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Detected: {excludeDetected === "file" ? "file (--excludefile)" : "exclude list (--exclude)"}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Output format</label>
          <select
            value={output.format}
            onChange={(e) => onOutputChange({ ...output, format: e.target.value as NmapOutputFormat })}
            className={`${selectClasses} w-full`}
          >
            {(Object.keys(OUTPUT_FORMAT_LABELS) as NmapOutputFormat[]).map((format) => (
              <option key={format} value={format}>
                {OUTPUT_FORMAT_LABELS[format]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Output path</label>
          <input
            type="text"
            value={output.path}
            disabled={output.format === "none"}
            onChange={(e) => onOutputChange({ ...output, path: e.target.value })}
            placeholder="scan-results"
            className={`${inputClasses} disabled:opacity-40`}
          />
        </div>
      </div>
    </div>
  );
}
