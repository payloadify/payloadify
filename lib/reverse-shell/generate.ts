import { ShellEncoder } from "./encoders";
import { ShellParams } from "./params";
import { ShellVariant } from "./shells";

export interface BuildShellOptions {
  encoded: boolean;
  encoder: ShellEncoder;
}

/** Renders the selected shell variant's one-liner, optionally swapping in its encoded execution
 *  form (only meaningful where the variant defines one, e.g. PowerShell -EncodedCommand), then
 *  applies the generic post-encoder on top. Pure/deterministic — matches the "no random
 *  generation" requirement. */
export function buildShell(shell: ShellVariant, params: ShellParams, opts: BuildShellOptions): string {
  const base = opts.encoded && shell.renderEncoded ? shell.renderEncoded(params) : shell.render(params);
  return opts.encoder.apply(base);
}

/** Builds the on-disk file body for the "save as file" feature — always derived from the raw
 *  (non-encoded, non-post-encoded) one-liner, since a downloaded script needs to be directly
 *  runnable by its interpreter. */
export function buildFileBody(shell: ShellVariant, params: ShellParams): string {
  const oneLiner = shell.render(params);
  return shell.file.toFileBody ? shell.file.toFileBody(oneLiner, params) : oneLiner;
}
