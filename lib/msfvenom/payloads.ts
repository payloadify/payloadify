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
}

const WINDOWS_FORMATS: FormatId[] = [
  "exe", "dll", "msi", "cab", "scr", "ps1", "vbs", "hta",
  "asp", "aspx", "jsp", "war", "php", "raw", "hex", "c", "csharp", "vba", "veil",
];
const LINUX_SHELL_FORMATS: FormatId[] = ["elf", "elf32", "elf64", "py", "pl", "rb", "php", "raw", "hex", "c"];
const LINUX_METERPRETER_FORMATS: FormatId[] = ["elf", "elf32", "elf64"];
const MACOS_FORMATS: FormatId[] = ["macho", "macho32", "macho64", "raw", "hex", "c"];
const ANDROID_FORMATS: FormatId[] = ["apk", "dex"];
const PYTHON_FORMATS: FormatId[] = ["py", "raw"];
const WINDOWS_ARCHS: ArchId[] = ["x86", "x64"];
const LINUX_STANDARD_ARCHS: ArchId[] = ["x86", "x64"];
const LINUX_IOT_ARCHS: ArchId[] = [
  "x86", "x64", "x86_64", "armv5l", "armv5b", "armv6l", "armv7l", "aarch64", "mips", "mips64", "ppc",
];
const MACOS_ARCHS: ArchId[] = ["x86", "x64"];
const ANDROID_ARCHS: ArchId[] = ["armeabi-v7a", "arm64-v8a"];

export const MSFVENOM_PAYLOADS: MsfvenomPayload[] = [
  {
    id: "windows/meterpreter/reverse_tcp",
    label: "Meterpreter — Reverse TCP (staged)",
    platform: "windows",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: "windows/meterpreter_reverse_tcp",
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_bind",
    whyUseIt:
      "Bind shell — target listens, you connect in. Useful when the target has an open inbound port but filters outbound traffic.",
  },
  {
    id: "windows/meterpreter/reverse_udp",
    label: "Meterpreter — Reverse UDP (staged)",
    platform: "windows",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse_udp",
    whyUseIt: "Reverse UDP Meterpreter — less common, useful when TCP is filtered but UDP isn't.",
  },
  {
    id: "windows/meterpreter_reverse_http",
    label: "Meterpreter — Reverse HTTP (stageless)",
    platform: "windows",
    category: "Meterpreter",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "shell_bind",
    whyUseIt: "Plain cmd.exe bind shell — target listens, you connect in.",
  },
  {
    id: "windows/shell_reverse_udp",
    label: "Shell — Reverse UDP (cmd.exe)",
    platform: "windows",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: WINDOWS_FORMATS,
    supportsExitfunc: true,
    filenameSlug: "shell_reverse_udp",
    whyUseIt: "Plain cmd.exe reverse shell over UDP.",
  },
  {
    id: "windows/vncinject/reverse_tcp",
    label: "VNC Inject — Reverse TCP",
    platform: "windows",
    category: "VNC",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
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
    archPlacement: "flag-only",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: ["ps1"],
    supportsExitfunc: true,
    filenameSlug: "powershell_bind",
    whyUseIt: "PowerShell bind shell — target listens for the connection.",
  },
  {
    id: "windows/meterpreter/reverse_tcp_dll",
    label: "Meterpreter — Reverse TCP (DLL, reflective injection)",
    platform: "windows",
    category: "DLL Injection",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: WINDOWS_ARCHS,
    defaultArch: "x86",
    compatibleFormats: ["dll"],
    supportsExitfunc: true,
    filenameSlug: "meterpreter_reverse_dll",
    whyUseIt:
      "Meterpreter packaged as a DLL for reflective injection into a running process — never touches disk as a standalone .exe, which helps evade file-based AV detection.",
    note: "Format is locked to dll — this payload is designed for reflective DLL injection (e.g. via rundll32 or a custom loader), not standalone execution.",
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
    archs: ANDROID_ARCHS,
    defaultArch: "armeabi-v7a",
    compatibleFormats: ANDROID_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "meterpreter_reverse",
    whyUseIt:
      "Full Meterpreter for Android, delivered as an installable .apk. LHOST/LPORT are mandatory, and the APK needs to be signed for installation on most devices.",
  },
  {
    id: "android/meterpreter/reverse_https",
    label: "Meterpreter — Reverse HTTPS",
    platform: "android",
    category: "Meterpreter",
    staging: "staged",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: ANDROID_ARCHS,
    defaultArch: "armeabi-v7a",
    compatibleFormats: ANDROID_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "meterpreter_reverse_https",
    whyUseIt: "HTTPS variant of Android Meterpreter — encrypted C2 channel, same delivery/signing requirements as the TCP version.",
  },
  {
    id: "android/shell_reverse_tcp",
    label: "Shell — Reverse TCP",
    platform: "android",
    category: "Shell",
    staging: "stageless",
    stagingSiblingId: null,
    archPlacement: "flag-only",
    archs: ANDROID_ARCHS,
    defaultArch: "armeabi-v7a",
    compatibleFormats: ANDROID_FORMATS,
    supportsExitfunc: false,
    filenameSlug: "shell_reverse",
    whyUseIt: "Basic Android shell payload — less common than Meterpreter since it lacks post-exploitation features, but smaller.",
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
