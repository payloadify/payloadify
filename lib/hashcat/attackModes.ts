export type AttackModeId = "0" | "1" | "3" | "6" | "7";

export type AttackModeField = "wordlist" | "wordlist2" | "mask";

export interface AttackMode {
  id: AttackModeId;
  name: string;
  description: string;
  /** Positional CLI args that follow the target, in the order hashcat expects them. */
  fields: AttackModeField[];
}

/** Association attack (-a 9) is omitted — niche/rare for this audience, easy follow-up later. */
export const ATTACK_MODES: AttackMode[] = [
  {
    id: "0",
    name: "Straight / Dictionary",
    description: "Try each word in a wordlist as-is (optionally mutated by a rules file).",
    fields: ["wordlist"],
  },
  {
    id: "1",
    name: "Combination",
    description: "Concatenate every word from wordlist 1 with every word from wordlist 2.",
    fields: ["wordlist", "wordlist2"],
  },
  {
    id: "3",
    name: "Brute-force / Mask",
    description: "Try every combination matching a character mask (e.g. ?u?l?l?l?l?d?d?d?d).",
    fields: ["mask"],
  },
  {
    id: "6",
    name: "Hybrid Wordlist + Mask",
    description: "Append a mask to each wordlist entry (e.g. password?d?d?d?d).",
    fields: ["wordlist", "mask"],
  },
  {
    id: "7",
    name: "Hybrid Mask + Wordlist",
    description: "Prepend a mask to each wordlist entry (e.g. ?d?d?d?dpassword).",
    fields: ["mask", "wordlist"],
  },
];

export const ATTACK_MODES_BY_ID: Record<AttackModeId, AttackMode> = Object.fromEntries(
  ATTACK_MODES.map((m) => [m.id, m]),
) as Record<AttackModeId, AttackMode>;
