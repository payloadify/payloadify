import type { ArchId } from "./archs";
import type { FormatId } from "./formats";
import type { ArchPlacement, Platform, Staging } from "./params";

export type PayloadId = string;

export interface MsfvenomPayload {
  id: PayloadId;
  label: string;
  platform: Platform;
  /** Optgroup bucket for the payload dropdown, e.g. "Meterpreter", "Shell", "VNC". */
  category: string;
  staging: Staging;
  /** The staged/stageless counterpart's id, when the catalog has one — used to power the
   *  Advanced Options "Staging" toggle. Null when there's no real sibling to switch to. */
  stagingSiblingId: PayloadId | null;
  archPlacement: ArchPlacement;
  /** Empty array means "architecture doesn't apply" (e.g. Python) — generate.ts omits -a entirely. */
  archs: ArchId[];
  defaultArch: ArchId | null;
  compatibleFormats: FormatId[];
  supportsExitfunc: boolean;
  /** Base filename (no extension/arch suffix) used by suggestFilename() in Custom mode. */
  filenameSlug: string;
  whyUseIt: string;
  note?: string;
  /** Android's only real -f value is "raw" (msfvenom has no dedicated apk/dex format) — but unlike
   *  other raw usages, Android *always* needs -o to produce an installable .apk file. Set together
   *  with filenameExtension so generate.ts/suggestFilename() force the file to have a real extension. */
  forceOutputFilename?: boolean;
  /** Overrides the selected format's extension when suggesting a filename — needed for Android,
   *  where the format is "raw" (extension "") but the output must still be named *.apk. */
  filenameExtension?: string;
}

const WINDOWS_FORMATS: FormatId[] = [
  "exe", "exe-only", "exe-service", "exe-small", "dll", "msi", "msi-nouac", "jar", "hta-psh", "psh", "psh-cmd", "psh-net",
  "ps1", "vbs", "asp", "aspx", "war", "raw", "hex", "c", "csharp", "vba", "vbapplication", "vbscript", "powershell",
  "base32", "base64", "js_be", "js_le",
];
const LINUX_SHELL_FORMATS: FormatId[] = ["elf", "elf-so", "bash", "sh", "py", "pl", "rb", "raw", "hex", "c", "base32", "base64", "js_be", "js_le"];
const LINUX_METERPRETER_FORMATS: FormatId[] = ["elf", "elf-so"];
const MACOS_FORMATS: FormatId[] = ["macho", "bash", "sh", "raw", "hex", "c", "base32", "base64", "js_be", "js_le"];
/** msfvenom has no dedicated apk/dex -f value — Android output is always -f raw -o file.apk. */
const ANDROID_FORMATS: FormatId[] = ["raw"];
const PYTHON_FORMATS: FormatId[] = ["py", "raw"];
const WINDOWS_ARCHS: ArchId[] = ["x86", "x64"];
/** UDP stagers/stages have no x64 module in the framework (only modules/payloads/stagers/windows/
 *  reverse_udp.rb — no windows/x64/reverse_udp.rb) — x86 is the only real option. */
const WINDOWS_ARCHS_UDP_X86_ONLY: ArchId[] = ["x86"];
const LINUX_STANDARD_ARCHS: ArchId[] = ["x86", "x64"];
/** Real msfvenom -a values are generic "armle"/"armbe" (endianness only) — not chip-generation-
 *  specific labels like armv5l/armv6l/armv7l, which aren't accepted by -a. */
const LINUX_IOT_ARCHS: ArchId[] = ["x86", "x64", "x86_64", "armle", "armbe", "aarch64", "mips", "mips64", "ppc"];
const MACOS_ARCHS: ArchId[] = ["x86", "x64"];

/** Windows x64 entries verified against the metasploit-framework module tree
 *  (modules/payloads/{stagers,stages,singles}/windows/x64/*) — x64 is a genuinely separate module
 *  from the flat x86 one, not the same module reached via -a x64 (see ArchPlacement in params.ts).
 *  windows/meterpreter/reverse_udp is intentionally not offered — Meterpreter's stage transfer
 *  protocol isn't valid over UDP, so the framework doesn't support the combination.
 *  windows/shell/reverse_udp is x86-only: the framework has no windows/x64/reverse_udp.rb stager. */
export const MSFVENOM_PAYLOADS: MsfvenomPayload[] = [
  {
    id: "windows/meterpreter/reverse_tcp",
    label: "Meterpreter — Reverse TCP (staged)",
    platform: "windows",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: "windows/meterpreter_reverse_tcp",
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse",
    whyUseIt:
      "Full interactive Meterpreter session over reverse TCP. Default choice for post-exploitation — staged, so the initial dropped file stays small (~3-5KB) and downloads the rest on connection.",
  },
  {
    id: "windows/meterpreter/reverse_https",
    label: "Meterpreter — Reverse HTTPS (staged)",
    platform: "windows",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: "windows/meterpreter_reverse_https",
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse_https",
    whyUseIt:
      "Reverse HTTPS Meterpreter — the encrypted C2 channel is harder to detect on the wire than plain TCP, but requires SSL setup on the listener.",
  },
  {
    id: "windows/meterpreter/bind_tcp",
    label: "Meterpreter — Bind TCP (staged)",
    platform: "windows",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_bind",
    whyUseIt:
      "Bind shell — target listens, you connect in. Useful when the target has an open inbound port but filters outbound traffic.",
  },
  {
    id: "windows/meterpreter_reverse_http",
    label: "Meterpreter — Reverse HTTP (stageless)",
    platform: "windows",
    category: "Meterpreter",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse_http_stageless",
    whyUseIt:
      "Stageless HTTP Meterpreter — the entire payload is embedded in one file, no secondary download needed. Runs immediately, but larger (~200KB+) and more visible to AV.",
  },
  {
    id: "windows/meterpreter_reverse_https",
    label: "Meterpreter — Reverse HTTPS (stageless)",
    platform: "windows",
    category: "Meterpreter",
    staging: "stageless",
    stagingSiblingId: "windows/meterpreter/reverse_https",
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse_https_stageless",
    whyUseIt: "Stageless HTTPS Meterpreter — single-file, encrypted C2, no staging infrastructure required.",
  },
  {
    id: "windows/meterpreter_reverse_tcp",
    label: "Meterpreter — Reverse TCP (stageless)",
    platform: "windows",
    category: "Meterpreter",
    staging: "stageless",
    stagingSiblingId: "windows/meterpreter/reverse_tcp",
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse_stageless",
    whyUseIt:
      "Stageless TCP Meterpreter — full payload in one file, no staging listener needed for delivery, but larger and more AV-visible than the staged version.",
  },
  {
    id: "windows/shell_reverse_tcp",
    label: "Shell — Reverse TCP (cmd.exe)",
    platform: "windows",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "shell_reverse",
    whyUseIt:
      "Plain cmd.exe reverse shell — no Meterpreter features, no post-exploitation extras. Smaller and simpler than Meterpreter when you just need command execution.",
  },
  {
    id: "windows/shell_bind_tcp",
    label: "Shell — Bind TCP (cmd.exe)",
    platform: "windows",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "shell_bind",
    whyUseIt: "Plain cmd.exe bind shell — target listens, you connect in.",
  },
  {
    id: "windows/shell/reverse_udp",
    label: "Shell — Reverse UDP (cmd.exe)",
    platform: "windows",
    category: "Shell",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS_UDP_X86_ONLY,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "shell_reverse_udp",
    whyUseIt: "Plain cmd.exe reverse shell over UDP.",
    note: "Actually a stager+stage combo (windows/shell/reverse_udp), unlike the TCP/bind shell payloads which are true stageless singles — msfvenom has no windows/shell_reverse_udp single. x86 only, since there's no x64 UDP stager module.",
  },
  {
    id: "windows/vncinject/reverse_tcp",
    label: "VNC Inject — Reverse TCP",
    platform: "windows",
    category: "VNC",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "vncinject_reverse",
    whyUseIt:
      "VNC injected into a running process — gives interactive GUI access to the target's desktop. Useful for social engineering demos, not just a shell.",
  },
  {
    id: "windows/vncinject/bind_tcp",
    label: "VNC Inject — Bind TCP",
    platform: "windows",
    category: "VNC",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "vncinject_bind",
    whyUseIt: "VNC bind — target listens for the incoming VNC connection.",
  },
  {
    id: "windows/powershell_reverse_tcp",
    label: "PowerShell — Reverse TCP",
    platform: "windows",
    category: "PowerShell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: ["ps1"],
    supportsExitfunc: true,
    filenameSlug: "powershell_reverse",
    whyUseIt:
      "PowerShell reverse shell — runs natively on Windows 3.0+ via powershell.exe, no compiled binary needed. Evasion-friendly since it blends in with legitimate admin activity.",
  },
  {
    id: "windows/powershell_bind_tcp",
    label: "PowerShell — Bind TCP",
    platform: "windows",
    category: "PowerShell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "windows-arch-segment",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: ["ps1"],
    supportsExitfunc: true,
    filenameSlug: "powershell_bind",
    whyUseIt: "PowerShell bind shell — target listens for the connection.",
  },
  {
    id: "linux/{arch}/meterpreter/reverse_tcp",
    label: "Meterpreter — Reverse TCP",
    platform: "linux",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "path-segment",
    archs: LINUX_STANDARD_ARCHS,
    defaultArch: "x64",
    compatibleFormats: LINUX_METERPRETER_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "meterpreter_reverse",
    whyUseIt:
      "Full Meterpreter on Linux — less common than the Windows version and requires libc compatibility with the target, but gives the same post-exploitation feature set.",
  },
  {
    id: "linux/{arch}/shell_reverse_tcp",
    label: "Shell — Reverse TCP",
    platform: "linux",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "path-segment",
    archs: LINUX_IOT_ARCHS,
    defaultArch: "x64",
    compatibleFormats: LINUX_SHELL_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "shell_reverse",
    whyUseIt:
      "Standard Linux reverse shell — plain command execution via /bin/sh, works across the widest range of architectures including IoT/embedded targets.",
  },
  {
    id: "linux/{arch}/shell_bind_tcp",
    label: "Shell — Bind TCP",
    platform: "linux",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "path-segment",
    archs: LINUX_IOT_ARCHS,
    defaultArch: "x64",
    compatibleFormats: LINUX_SHELL_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "shell_bind",
    whyUseIt: "Linux bind shell — target listens, you connect in. Useful when outbound is filtered but an inbound port is open.",
  },
  {
    id: "osx/{arch}/shell_reverse_tcp",
    label: "Shell — Reverse TCP",
    platform: "macos",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "path-segment",
    archs: MACOS_ARCHS,
    defaultArch: "x64",
    compatibleFormats: MACOS_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "shell_reverse_macos",
    whyUseIt: "macOS reverse shell — Meterpreter is less commonly available on macOS, so a plain shell is the standard choice.",
  },
  {
    id: "osx/{arch}/meterpreter/reverse_tcp",
    label: "Meterpreter — Reverse TCP",
    platform: "macos",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "path-segment",
    archs: ["x64"],
    defaultArch: "x64",
    compatibleFormats: MACOS_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "meterpreter_reverse_macos",
    whyUseIt:
      "macOS Meterpreter, where available — gives post-exploitation features but has narrower architecture support than the plain shell payload.",
  },
  {
    id: "android/meterpreter/reverse_tcp",
    label: "Meterpreter — Reverse TCP",
    platform: "android",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: [],
    defaultArch: null,
    compatibleFormats: ANDROID_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "meterpreter_reverse",
    forceOutputFilename: true,
    filenameExtension: "apk",
    whyUseIt:
      "Full Meterpreter for Android, delivered as an installable .apk. LHOST/LPORT are mandatory, and the APK needs to be signed for installation on most devices.",
    note: "Architecture doesn't apply — Android Meterpreter runs as Dalvik/Java bytecode, not arch-specific native code. Real msfvenom -a values don't include an Android ABI name.",
  },
  {
    id: "android/meterpreter/reverse_https",
    label: "Meterpreter — Reverse HTTPS",
    platform: "android",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: [],
    defaultArch: null,
    compatibleFormats: ANDROID_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "meterpreter_reverse_https",
    forceOutputFilename: true,
    filenameExtension: "apk",
    whyUseIt: "HTTPS variant of Android Meterpreter — encrypted C2 channel, same delivery/signing requirements as the TCP version.",
    note: "Architecture doesn't apply — Android Meterpreter runs as Dalvik/Java bytecode, not arch-specific native code.",
  },
  {
    id: "android/shell_reverse_tcp",
    label: "Shell — Reverse TCP",
    platform: "android",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: [],
    defaultArch: null,
    compatibleFormats: ANDROID_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "shell_reverse",
    forceOutputFilename: true,
    filenameExtension: "apk",
    whyUseIt: "Basic Android shell payload — less common than Meterpreter since it lacks post-exploitation features, but smaller.",
    note: "Architecture doesn't apply — Android payloads run as Dalvik/Java bytecode, not arch-specific native code.",
  },
  {
    id: "python/meterpreter/reverse_tcp",
    label: "Meterpreter — Reverse TCP (cross-platform)",
    platform: "multi",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: [],
    defaultArch: null,
    compatibleFormats: PYTHON_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "reverse_shell",
    whyUseIt:
      "Cross-platform Meterpreter — runs anywhere Python is installed (Linux, macOS, even Windows), no architecture-specific build needed.",
    note: "Architecture doesn't apply — the Python interpreter abstracts it away.",
  },
];

export const MSFVENOM_PAYLOADS_BY_ID: Record<PayloadId, MsfvenomPayload> = Object.fromEntries(
  MSFVENOM_PAYLOADS.map((p) => [p.id, p]),
);

export const MSFVENOM_CATEGORIES: string[] = [...new Set(MSFVENOM_PAYLOADS.map((p) => p.category))];
