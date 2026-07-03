export type ArchId =
  | "x86"
  | "x64"
  | "x86_64"
  | "armeabi-v7a"
  | "arm64-v8a"
  | "armv5l"
  | "armv5b"
  | "armv6l"
  | "armv7l"
  | "aarch64"
  | "mips"
  | "mips64"
  | "ppc";

export type ArchSupportLevel = "Good" | "Excellent" | "Limited";

export interface MsfvenomArch {
  id: ArchId;
  label: string;
  description: string;
  supportLevel?: ArchSupportLevel;
}

export const MSFVENOM_ARCHS: MsfvenomArch[] = [
  { id: "x86", label: "x86 (32-bit)", description: "Default for many older payloads; runs on 64-bit Windows via WoW64 or 32-bit Linux libs." },
  { id: "x64", label: "x64 (64-bit)", description: "Modern default — native 64-bit execution on Windows and Linux." },
  {
    id: "x86_64",
    label: "x86_64",
    description: "Alias of x64 on Linux — msfvenom accepts either name for the same 64-bit architecture.",
  },
  { id: "armeabi-v7a", label: "armeabi-v7a (Android, 32-bit ARM)", description: "Most common Android architecture, legacy and modern devices." },
  { id: "arm64-v8a", label: "arm64-v8a (Android, 64-bit ARM)", description: "Modern 64-bit Android devices." },
  { id: "armv5l", label: "armv5l", description: "Older 32-bit ARM (ARM9, some routers).", supportLevel: "Good" },
  { id: "armv5b", label: "armv5b (big-endian)", description: "Big-endian ARM, rarely used in modern IoT.", supportLevel: "Limited" },
  { id: "armv6l", label: "armv6l", description: "32-bit ARM — Raspberry Pi 1–3.", supportLevel: "Good" },
  { id: "armv7l", label: "armv7l", description: "32-bit ARM — Raspberry Pi 4 and most modern embedded ARM devices.", supportLevel: "Excellent" },
  { id: "aarch64", label: "aarch64 (64-bit ARM)", description: "64-bit ARM — Raspberry Pi 4 (64-bit), ARM servers.", supportLevel: "Excellent" },
  { id: "mips", label: "MIPS (32-bit)", description: "Older routers and embedded systems (D-Link, TP-Link, Netgear routers pre-2015).", supportLevel: "Good" },
  { id: "mips64", label: "MIPS64", description: "High-end routers and switches — rare in consumer IoT.", supportLevel: "Limited" },
  { id: "ppc", label: "PowerPC", description: "Big-endian, mostly legacy Cisco/networking gear.", supportLevel: "Limited" },
];

export const MSFVENOM_ARCHS_BY_ID: Record<ArchId, MsfvenomArch> = Object.fromEntries(
  MSFVENOM_ARCHS.map((a) => [a.id, a]),
) as Record<ArchId, MsfvenomArch>;
