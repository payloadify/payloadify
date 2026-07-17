import { ATTACK_MODES_BY_ID } from "./attackModes";
import { HashcatSelection } from "./params";

/** Single-quotes an arbitrary value for safe inclusion in a bash command line, escaping any
 *  embedded single quotes with the standard '\'' technique (close the quote, emit an escaped
 *  quote, reopen the quote). Without this, a value containing a `'` breaks out of the quoting
 *  entirely — e.g. a hash value of `abc' ; touch pwned #` would otherwise produce
 *  `'abc' ; touch pwned #'`, which *executes* `touch pwned` when the generated command is
 *  pasted into a shell. Applied to every free-text field below (not just the hash value) since
 *  wordlist/mask/rule/session/outfile paths are just as capable of containing spaces or shell
 *  metacharacters, and quoting them is always safe — hashcat receives the same literal string
 *  either way, quoted or not. */
function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** A hash *file* path (kind "file") is left unquoted — unlike a hash value, it's not expected to
 *  contain the `$`-prefixed crypt-format metacharacters that motivate quoting in the first place,
 *  and existing behavior/tests treat this kind as a plain positional arg. */
function quoteTargetValue(target: HashcatSelection["target"]): string {
  const trimmed = target.value.trim();
  return target.kind === "value" ? quoteShellArg(trimmed) : trimmed;
}

/** Pure, deterministic command builder — flag order:
 *  hashcat -m <mode> -a <attack> [-r rule]... [-1/-2/-3/-4 charset]... [--increment ...]
 *  [-w] [-O] [--force] [--potfile-disable] [--username] [--session] [-o --outfile-format]
 *  <target> [wordlist|wordlist2|mask positional args, in the attack mode's own order]
 *  Every free-text value (rules, charsets, session name, outfile, outfile format, wordlists,
 *  mask) is quoted via quoteShellArg — these are user-typed paths/strings that can contain
 *  spaces or shell metacharacters just as easily as the hash value can. */
export function buildCommand(sel: HashcatSelection): string {
  const parts: string[] = ["hashcat", "-m", String(sel.mode), "-a", sel.attackMode];

  for (const rule of sel.rules) {
    const trimmed = rule.trim();
    if (trimmed.length > 0) parts.push("-r", quoteShellArg(trimmed));
  }

  if (sel.attackMode === "3") {
    if (sel.charset1.trim()) parts.push("-1", quoteShellArg(sel.charset1.trim()));
    if (sel.charset2.trim()) parts.push("-2", quoteShellArg(sel.charset2.trim()));
    if (sel.charset3.trim()) parts.push("-3", quoteShellArg(sel.charset3.trim()));
    if (sel.charset4.trim()) parts.push("-4", quoteShellArg(sel.charset4.trim()));
    if (sel.incrementEnabled) {
      parts.push("--increment");
      if (sel.incrementMin !== null) parts.push("--increment-min", String(sel.incrementMin));
      if (sel.incrementMax !== null) parts.push("--increment-max", String(sel.incrementMax));
    }
  }

  if (sel.workload) parts.push("-w", String(sel.workload));
  if (sel.optimizedKernel) parts.push("-O");
  if (sel.force) parts.push("--force");
  if (sel.potfileDisable) parts.push("--potfile-disable");
  if (sel.usernameMode) parts.push("--username");
  if (sel.sessionName.trim()) parts.push("--session", quoteShellArg(sel.sessionName.trim()));
  if (sel.outfile.trim()) {
    parts.push("-o", quoteShellArg(sel.outfile.trim()));
    if (sel.outfileFormat.trim()) parts.push("--outfile-format", quoteShellArg(sel.outfileFormat.trim()));
  }

  parts.push(quoteTargetValue(sel.target));

  const attackMode = ATTACK_MODES_BY_ID[sel.attackMode];
  for (const field of attackMode.fields) {
    if (field === "wordlist") parts.push(quoteShellArg(sel.wordlist.trim()));
    if (field === "wordlist2") parts.push(quoteShellArg(sel.wordlist2.trim()));
    if (field === "mask") parts.push(quoteShellArg(sel.mask.trim()));
  }

  return parts.join(" ");
}

/** Companion command to view already-cracked results for this hash/file without re-running
 *  the attack — mirrors MSFVenom's "matching listener command" usage-guide pattern. */
export function buildShowCommand(sel: HashcatSelection): string {
  return ["hashcat", "-m", String(sel.mode), quoteTargetValue(sel.target), "--show"].join(" ");
}

/** Companion command to benchmark raw cracking speed for this mode on the user's own hardware. */
export function buildBenchmarkCommand(mode: number): string {
  return `hashcat -b -m ${mode}`;
}
