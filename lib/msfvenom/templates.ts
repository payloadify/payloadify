import type { ArchId } from "./archs";
import type { EncoderId } from "./encoders";
import type { FormatId } from "./formats";
import type { ExitfuncId } from "./params";
import type { PayloadId } from "./payloads";

export interface MsfvenomTemplate {
  id: string;
  label: string;
  /** May contain the literal "{arch}" token for path-segment payloads — resolved together with
   *  archId at generation time via resolvePayloadId(). */
  payloadId: PayloadId;
  formatId: FormatId;
  encoderId: EncoderId;
  /** 0 whenever encoderId is "none" — documentation-only in that case, generate.ts omits -i. */
  iterations: number;
  archId: ArchId | null;
  exitfunc: ExitfuncId | null;
  /** Literal filename, copied verbatim from the reference doc — not derived via suggestFilename(). */
  filename: string;
  notes: string;
}

export const MSFVENOM_TEMPLATES: MsfvenomTemplate[] = [
  {
    id: "windows-meterpreter-x86",
    label: "Windows Meterpreter (x86, Staged, AV Evasion)",
    payloadId: "windows/meterpreter/reverse_tcp",
    formatId: "exe",
    encoderId: "shikata_ga_nai",
    iterations: 2,
    archId: "x86",
    exitfunc: "thread",
    filename: "meterpreter_reverse_x86.exe",
    notes: "Most common template — full Meterpreter, x86 runs on both 32- and 64-bit Windows targets, shikata_ga_nai for AV evasion.",
  },
  {
    id: "windows-meterpreter-x64",
    label: "Windows Meterpreter (x64, Staged, AV Evasion)",
    payloadId: "windows/meterpreter/reverse_tcp",
    formatId: "exe",
    encoderId: "shikata_ga_nai",
    iterations: 2,
    archId: "x64",
    exitfunc: "thread",
    filename: "meterpreter_reverse_x64.exe",
    notes: "Same as the x86 template, for 64-bit targets — native integration on 64-bit Windows.",
  },
  {
    id: "windows-stageless-shell",
    label: "Windows Stageless Shell",
    payloadId: "windows/shell_reverse_tcp",
    formatId: "exe",
    encoderId: "none",
    iterations: 0,
    archId: "x86",
    exitfunc: "thread",
    filename: "shell_reverse_stageless.exe",
    notes: "Single-stage, no staging overhead — plain cmd.exe shell, no Meterpreter features.",
  },
  {
    id: "linux-x64-shell",
    label: "Linux x64 Reverse Shell",
    payloadId: "linux/{arch}/shell_reverse_tcp",
    formatId: "elf",
    encoderId: "none",
    iterations: 0,
    archId: "x64",
    exitfunc: null,
    filename: "shell_reverse_x64.elf",
    notes: "Standard Linux pentesting payload.",
  },
  {
    id: "linux-x86-shell",
    label: "Linux x86 Reverse Shell",
    payloadId: "linux/{arch}/shell_reverse_tcp",
    formatId: "elf",
    encoderId: "fnstenv_mov",
    iterations: 1,
    archId: "x86",
    exitfunc: null,
    filename: "shell_reverse_x86.elf",
    notes: "Legacy or 32-bit systems — fnstenv_mov encoding for lighter AV evasion.",
  },
  {
    id: "android-apk",
    label: "Android APK Meterpreter",
    payloadId: "android/meterpreter/reverse_tcp",
    formatId: "apk",
    encoderId: "none",
    iterations: 0,
    archId: "armeabi-v7a",
    exitfunc: null,
    filename: "meterpreter_reverse.apk",
    notes: "Mobile payload, generates an installable .apk.",
  },
  {
    id: "macos-x64-shell",
    label: "macOS x64 Reverse Shell",
    payloadId: "osx/{arch}/shell_reverse_tcp",
    formatId: "macho",
    encoderId: "none",
    iterations: 0,
    archId: "x64",
    exitfunc: null,
    filename: "shell_reverse_macos.macho",
    notes: "macOS native binary format.",
  },
  {
    id: "powershell-windows",
    label: "PowerShell (Windows, No .exe)",
    payloadId: "windows/powershell_reverse_tcp",
    formatId: "ps1",
    encoderId: "none",
    iterations: 0,
    archId: "x86",
    exitfunc: "thread",
    filename: "reverse_shell.ps1",
    notes: "PowerShell script format — no compiled binary to drop.",
  },
  {
    id: "python-cross-platform",
    label: "Python (Cross-Platform)",
    payloadId: "python/meterpreter/reverse_tcp",
    formatId: "py",
    encoderId: "none",
    iterations: 0,
    archId: null,
    exitfunc: null,
    filename: "reverse_shell.py",
    notes: "Interpreter-agnostic — runs anywhere Python is installed.",
  },
  {
    id: "vbs-windows",
    label: "VBS (Windows, No .exe)",
    payloadId: "windows/meterpreter/reverse_tcp",
    formatId: "vbs",
    encoderId: "none",
    iterations: 0,
    archId: "x86",
    exitfunc: "thread",
    filename: "reverse_shell.vbs",
    notes: "VBScript for Windows, runs via cscript.exe — no .exe dropped.",
  },
];

export const MSFVENOM_TEMPLATES_BY_ID: Record<string, MsfvenomTemplate> = Object.fromEntries(
  MSFVENOM_TEMPLATES.map((t) => [t.id, t]),
);

/** Learning Mode heuristic: Template 1 is Windows-targeted, uses shikata_ga_nai (the safest
 *  default against a Windows target's AV), and the reference doc's own notes call it "Most
 *  common" — least likely to produce a command a student then has to debug. */
export const RECOMMENDED_TEMPLATE_ID = "windows-meterpreter-x86";
