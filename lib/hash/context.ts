export type HashContextId = "unknown" | "windows" | "linux-unix" | "web-db" | "wifi";

export const HASH_CONTEXTS: { id: HashContextId; label: string }[] = [
  { id: "unknown", label: "Not sure / no context" },
  { id: "windows", label: "Windows (SAM, NTDS.dit, LSASS dump)" },
  { id: "linux-unix", label: "Linux/Unix (/etc/shadow, /etc/passwd)" },
  { id: "web-db", label: "Web app / database dump" },
  { id: "wifi", label: "WiFi capture (handshake/PMKID)" },
];

export const HASH_CONTEXTS_BY_ID: Record<HashContextId, { id: HashContextId; label: string }> = Object.fromEntries(
  HASH_CONTEXTS.map((c) => [c.id, c]),
) as Record<HashContextId, { id: HashContextId; label: string }>;
