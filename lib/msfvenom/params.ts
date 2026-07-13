export type Platform = "windows" | "linux" | "macos" | "android" | "multi";

/** "flag-only" payloads have no real per-arch module split (Android/Python) — arch doesn't
 *  appear in the command at all.
 *  "path-segment" payloads (Linux/macOS) bake arch into the -p value itself via a literal
 *  "{arch}" token in the id (e.g. linux/{arch}/shell_reverse_tcp -> linux/x64/shell_reverse_tcp)
 *  that generate.ts substitutes for every arch, including the default.
 *  "windows-arch-segment" payloads (Windows) also bake arch into -p, but asymmetrically: x86 is
 *  msfvenom's implicit/flat module (no segment — e.g. windows/meterpreter/reverse_tcp), while x64
 *  is a genuinely separate module living under an explicit "x64/" segment
 *  (windows/x64/meterpreter/reverse_tcp). There is no msfvenom -a flag involved for Windows —
 *  each module declares a single hard-coded Arch, so passing -a for a mismatched arch
 *  makes msfvenom raise IncompatibleArch rather than retarget the payload. */
export type ArchPlacement = "flag-only" | "path-segment" | "windows-arch-segment";

export type Staging = "staged" | "stageless";

export type ExitfuncId = "thread" | "process" | "seh";
