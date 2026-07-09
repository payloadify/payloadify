/** Partial masking for on-screen display of sensitive values — keeps a small head/tail
 *  visible (enough to recognize/verify at a glance, like "sk_live_51H8…xK9") while hiding
 *  the middle. Purely a display concern: Copy buttons must always use the real underlying
 *  value, never the masked string these functions return. */

const DEFAULT_HEAD_CHARS = 4;
const DEFAULT_TAIL_CHARS = 4;
const MAX_MASK_DOTS = 8;

/** Masks the middle of a flat string, keeping `headChars`/`tailChars` visible at each end.
 *  Strings too short to hide anything meaningful (not enough room left in the middle) are
 *  masked completely instead of leaking most/all of their content. The masked run is capped
 *  at MAX_MASK_DOTS dots regardless of actual middle length, so dot-count doesn't leak the
 *  value's exact length. */
export function maskMiddle(value: string, headChars = DEFAULT_HEAD_CHARS, tailChars = DEFAULT_TAIL_CHARS): string {
  if (!value) return "";
  const minLengthToPartiallyReveal = headChars + tailChars + 1;
  if (value.length < minLengthToPartiallyReveal) {
    return "•".repeat(value.length);
  }
  const middleLength = Math.min(value.length - headChars - tailChars, MAX_MASK_DOTS);
  return `${value.slice(0, headChars)}${"•".repeat(middleLength)}${value.slice(-tailChars)}`;
}

/** Masks a PEM block's key material while leaving the BEGIN/END markers fully visible —
 *  those aren't secret, they're identical for every key of that type. Line-wrapping is
 *  ignored (the body is flattened before masking) so head/tail char counts are exact. */
export function maskPem(pem: string, headChars = 12, tailChars = 12): string {
  const match = pem.match(/^(-----BEGIN [^-]+-----\n)([\s\S]*?)(\n-----END [^-]+-----)\s*$/);
  if (!match) return maskMiddle(pem, headChars, tailChars);
  const [, beginLine, body, endLine] = match;
  const flatBody = body.replace(/\s+/g, "");
  return `${beginLine}${maskMiddle(flatBody, headChars, tailChars)}${endLine}`;
}
