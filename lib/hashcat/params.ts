import type { AttackModeId } from "./attackModes";

export type TargetKind = "value" | "file";

export interface HashcatTarget {
  kind: TargetKind;
  /** The hash string (optionally `hash:salt`) when kind is "value", or a local file path when
   *  kind is "file". This tool never reads/writes the user's filesystem — a file path is just
   *  text the user will substitute on their own machine. */
  value: string;
}

export type WorkloadProfile = 1 | 2 | 3 | 4;

export interface HashcatSelection {
  mode: number;
  attackMode: AttackModeId;
  target: HashcatTarget;
  wordlist: string;
  wordlist2: string;
  mask: string;
  /** One entry per repeated -r flag. Blank entries are dropped at build time. */
  rules: string[];
  charset1: string;
  charset2: string;
  charset3: string;
  charset4: string;
  incrementEnabled: boolean;
  incrementMin: number | null;
  incrementMax: number | null;
  workload: WorkloadProfile | null;
  optimizedKernel: boolean;
  force: boolean;
  potfileDisable: boolean;
  usernameMode: boolean;
  sessionName: string;
  outfile: string;
  outfileFormat: string;
}
