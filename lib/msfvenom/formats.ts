export type FormatId = string;
export type FormatCategory = "executable" | "script" | "web" | "raw";

export interface MsfvenomFormat {
  id: FormatId;
  label: string;
  /** File extension without the dot; "" for formats that don't produce a conventional extension. */
  extension: string;
  category: FormatCategory;
  /** False for stdout-dump formats (raw bytecode / source-code snippets) where msfvenom prints to
   *  the console rather than writing a file — generate.ts omits -o entirely for these. */
  producesFile: boolean;
  note?: string;
}

export const MSFVENOM_FORMATS: MsfvenomFormat[] = [
  { id: "exe", label: "EXE (.exe) — Windows executable", extension: "exe", category: "executable", producesFile: true },
  {
    id: "elf",
    label: "ELF — Linux executable",
    extension: "elf",
    category: "executable",
    producesFile: true,
    note: "No extension is required by msfvenom convention on Linux; .elf is added here for clarity.",
  },
  { id: "elf32", label: "ELF32 — explicit 32-bit Linux executable", extension: "elf", category: "executable", producesFile: true },
  { id: "elf64", label: "ELF64 — explicit 64-bit Linux executable", extension: "elf", category: "executable", producesFile: true },
  {
    id: "macho",
    label: "Mach-O — macOS binary",
    extension: "macho",
    category: "executable",
    producesFile: true,
    note: "No extension is required by msfvenom convention on macOS; .macho is added here for clarity.",
  },
  { id: "macho32", label: "Mach-O32 — 32-bit macOS binary (rare)", extension: "macho", category: "executable", producesFile: true },
  { id: "macho64", label: "Mach-O64 — 64-bit macOS binary", extension: "macho", category: "executable", producesFile: true },
  { id: "apk", label: "APK — Android package", extension: "apk", category: "executable", producesFile: true },
  { id: "dex", label: "DEX — raw Dalvik executable (rarely used)", extension: "dex", category: "executable", producesFile: true },
  { id: "dll", label: "DLL — Windows Dynamic Link Library", extension: "dll", category: "executable", producesFile: true },
  { id: "msi", label: "MSI — Windows Installer package", extension: "msi", category: "executable", producesFile: true },
  { id: "cab", label: "CAB — Cabinet archive (legacy packaging)", extension: "cab", category: "executable", producesFile: true },
  { id: "scr", label: "SCR — Screensaver executable (social engineering)", extension: "scr", category: "executable", producesFile: true },
  { id: "ps1", label: "PS1 — PowerShell script", extension: "ps1", category: "script", producesFile: true },
  { id: "vbs", label: "VBS — VBScript, runs via cscript.exe", extension: "vbs", category: "script", producesFile: true },
  {
    id: "hta",
    label: "HTA — HTML Application (mshta.exe)",
    extension: "hta",
    category: "script",
    producesFile: true,
    note: "Not in msfvenom's official -f list; documented community technique — verify support on your msfvenom version.",
  },
  { id: "asp", label: "ASP — Active Server Pages web shell (IIS)", extension: "asp", category: "web", producesFile: true },
  { id: "aspx", label: "ASPX — ASP.NET web shell (IIS)", extension: "aspx", category: "web", producesFile: true },
  { id: "jsp", label: "JSP — Java Server Pages web shell", extension: "jsp", category: "web", producesFile: true },
  { id: "war", label: "WAR — Java Web Archive", extension: "war", category: "web", producesFile: true },
  { id: "php", label: "PHP — PHP web shell", extension: "php", category: "web", producesFile: true },
  { id: "py", label: "PY — Python script", extension: "py", category: "script", producesFile: true },
  { id: "rb", label: "RB — Ruby script", extension: "rb", category: "script", producesFile: true },
  { id: "pl", label: "PL — Perl script", extension: "pl", category: "script", producesFile: true },
  { id: "raw", label: "Raw — direct bytecode, no wrapper", extension: "", category: "raw", producesFile: false },
  { id: "hex", label: "Hex — hexadecimal shellcode dump", extension: "", category: "raw", producesFile: false },
  { id: "c", label: "C — C source code array", extension: "", category: "raw", producesFile: false },
  { id: "csharp", label: "C# — C# source code array", extension: "", category: "raw", producesFile: false },
  { id: "java", label: "Java — Java source template", extension: "", category: "raw", producesFile: false },
  { id: "vba", label: "VBA — Office macro code snippet", extension: "", category: "raw", producesFile: false },
  { id: "veil", label: "Veil — Veil-Evasion framework integration output", extension: "", category: "raw", producesFile: false },
];

export const MSFVENOM_FORMATS_BY_ID: Record<FormatId, MsfvenomFormat> = Object.fromEntries(
  MSFVENOM_FORMATS.map((f) => [f.id, f]),
);
