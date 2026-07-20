import { ATTACK_MODES_BY_ID } from "./attackModes";
import { HashcatSelection } from "./params";

export interface HashcatValidation {
  ok: boolean;
  message?: string;
}

export function isValidMode(mode: number): boolean {
  return Number.isInteger(mode) && mode >= 0;
}

/** Checks only what's required to assemble a syntactically complete command — e.g. it doesn't
 *  try to validate mask syntax or wordlist paths beyond non-empty, since this tool never touches
 *  the user's filesystem and can't know what's actually there. */
export function validateSelection(sel: HashcatSelection): HashcatValidation {
  if (!isValidMode(sel.mode)) return { ok: false, message: "Enter a valid Hashcat mode number (0 or higher)." };

  if (sel.target.value.trim().length === 0) {
    return {
      ok: false,
      message: sel.target.kind === "file" ? "Enter a hash file path." : "Enter a hash value.",
    };
  }

  const attackMode = ATTACK_MODES_BY_ID[sel.attackMode];
  for (const field of attackMode.fields) {
    if (field === "wordlist" && sel.wordlist.trim().length === 0) {
      return { ok: false, message: "Enter a wordlist path." };
    }
    if (field === "wordlist2" && sel.wordlist2.trim().length === 0) {
      return { ok: false, message: "Enter a second wordlist path." };
    }
    if (field === "mask" && sel.mask.trim().length === 0) {
      return { ok: false, message: "Enter a mask." };
    }
  }

  if (
    sel.incrementEnabled &&
    sel.incrementMin !== null &&
    sel.incrementMax !== null &&
    sel.incrementMin > sel.incrementMax
  ) {
    return { ok: false, message: "Increment min cannot be greater than increment max." };
  }

  return { ok: true };
}
