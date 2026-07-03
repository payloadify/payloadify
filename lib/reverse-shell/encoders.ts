import { bytesToBase64, percentEncodeBytes } from "../encoding/bytes";
import { utf8Bytes } from "../hash/bytes";

export type EncoderId = "none" | "base64" | "url";

export interface ShellEncoder {
  id: EncoderId;
  label: string;
  /** Transforms the raw one-liner into the encoded form. Pure — no randomness. */
  apply: (oneLiner: string) => string;
  /** Shown next to the output whenever this encoder is active: the encoded string on its own
   *  isn't paste-and-run like the raw payload, so the UI must tell the user how to decode/run it. */
  usageNote: string | null;
}

export const SHELL_ENCODERS: ShellEncoder[] = [
  {
    id: "none",
    label: "None",
    apply: (oneLiner) => oneLiner,
    usageNote: null,
  },
  {
    id: "base64",
    label: "Base64",
    apply: (oneLiner) => bytesToBase64(utf8Bytes(oneLiner)),
    usageNote: "Not directly runnable — decode and execute it, e.g. echo <base64> | base64 -d | bash",
  },
  {
    id: "url",
    label: "URL-encode",
    apply: (oneLiner) => percentEncodeBytes(utf8Bytes(oneLiner)),
    usageNote: "Intended for embedding in a URL/query parameter — the receiving context must URL-decode it before it will run.",
  },
];

export const SHELL_ENCODERS_BY_ID: Record<EncoderId, ShellEncoder> = Object.fromEntries(
  SHELL_ENCODERS.map((e) => [e.id, e]),
) as Record<EncoderId, ShellEncoder>;

export const NONE_ENCODER = SHELL_ENCODERS_BY_ID.none;
