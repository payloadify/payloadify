export type EncoderId =
  | "none"
  | "shikata_ga_nai"
  | "fnstenv_mov"
  | "jmp_call_additive"
  | "additive_feedback"
  | "xor_dynamic"
  | "polymorphic_shellcode"
  | "fnstenv";

export type EncoderEffectiveness = "Low-Medium" | "Medium" | "Medium-High" | "High";
export type EncoderSpeed = "Very Fast" | "Fast" | "Medium";

export interface MsfvenomEncoder {
  id: EncoderId;
  label: string;
  effectiveness: EncoderEffectiveness;
  speed: EncoderSpeed;
  /** Highest iteration count worth using — encoding loops rarely help past this, and more
   *  iterations means slower generation/execution for diminishing returns. */
  maxIterations: number;
  whyUseIt: string;
}

export const NONE_ENCODER: MsfvenomEncoder = {
  id: "none",
  label: "None (no encoding)",
  effectiveness: "Low-Medium",
  speed: "Very Fast",
  maxIterations: 0,
  whyUseIt:
    "Fastest to generate, smallest payload. Fine for stageless payloads or size-constrained targets — but raw, unencoded shellcode is the easiest thing for signature-based AV to catch.",
};

export const MSFVENOM_ENCODERS: MsfvenomEncoder[] = [
  NONE_ENCODER,
  {
    id: "shikata_ga_nai",
    label: "shikata_ga_nai",
    effectiveness: "High",
    speed: "Fast",
    maxIterations: 10,
    whyUseIt:
      "The most common msfvenom encoder — polymorphic, so each pass produces different bytes. Best default choice for Windows targets; 2–4 iterations is the typical sweet spot for AV evasion.",
  },
  {
    id: "fnstenv_mov",
    label: "fnstenv_mov",
    effectiveness: "Medium-High",
    speed: "Medium",
    maxIterations: 5,
    whyUseIt:
      "FPU-instruction-based encoder, less commonly fingerprinted by signature AV than shikata_ga_nai. Good choice for x86 Linux targets.",
  },
  {
    id: "jmp_call_additive",
    label: "jmp_call_additive",
    effectiveness: "Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt: "Jump/call-based obfuscation — simple but effective, fast to generate.",
  },
  {
    id: "additive_feedback",
    label: "additive_feedback",
    effectiveness: "Low-Medium",
    speed: "Fast",
    maxIterations: 3,
    whyUseIt: "Simple XOR-based encoding. Fast, but less reliable against modern AV than shikata_ga_nai.",
  },
  {
    id: "xor_dynamic",
    label: "xor_dynamic",
    effectiveness: "Low-Medium",
    speed: "Very Fast",
    maxIterations: 2,
    whyUseIt: "XOR with a dynamic key. Very fast, but easily detectable on its own — best combined with other evasion, not relied on alone.",
  },
  {
    id: "polymorphic_shellcode",
    label: "polymorphic_shellcode",
    effectiveness: "Medium",
    speed: "Medium",
    maxIterations: 3,
    whyUseIt: "Generates different code on every run, which helps against static signature matching across multiple generations.",
  },
  {
    id: "fnstenv",
    label: "fnstenv",
    effectiveness: "Medium",
    speed: "Medium",
    maxIterations: 5,
    whyUseIt: "Legacy variant of fnstenv_mov with similar FPU-based obfuscation — kept for compatibility with older msfvenom guidance.",
  },
];

export const MSFVENOM_ENCODERS_BY_ID: Record<EncoderId, MsfvenomEncoder> = Object.fromEntries(
  MSFVENOM_ENCODERS.map((e) => [e.id, e]),
) as Record<EncoderId, MsfvenomEncoder>;
