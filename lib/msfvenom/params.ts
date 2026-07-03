export type Platform = "windows" | "linux" | "macos" | "android" | "multi";

/** "flag-only" payloads take arch via the -a flag (e.g. windows/meterpreter/reverse_tcp -a x64).
 *  "path-segment" payloads bake arch into the -p value itself (e.g. linux/x64/shell_reverse_tcp)
 *  — their id contains a literal "{arch}" token that generate.ts substitutes. */
export type ArchPlacement = "flag-only" | "path-segment";

export type Staging = "staged" | "stageless";

export type ExitfuncId = "thread" | "process" | "seh";
