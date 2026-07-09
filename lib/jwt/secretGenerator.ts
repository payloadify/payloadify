/** Random HMAC secret generator — "Standard" (alphanumeric) vs. "Enhanced" (+ special
 *  characters) charset, with a selectable target entropy in bits (128–512, default 256,
 *  per CLAUDE.md's roadmap note). Uses rejection sampling against crypto.getRandomValues
 *  to avoid modulo bias — a naive `value % charsetSize` would skew toward low-index
 *  characters whenever charsetSize doesn't evenly divide 2^32. */

export const SECRET_BITS_MIN = 128;
export const SECRET_BITS_MAX = 512;
export const SECRET_BITS_DEFAULT = 256;

/** Common strength choices offered as one-click shortcuts alongside the slider. */
export const SECRET_BIT_PRESETS = [128, 192, 256, 384, 512] as const;

export type SecretCharsetMode = "standard" | "enhanced";

const STANDARD_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const ENHANCED_EXTRA_CHARS = "!@#$%^&*()-_=+[]{}|;:,.<>?/~";
const ENHANCED_CHARS = STANDARD_CHARS + ENHANCED_EXTRA_CHARS;

function charsetFor(mode: SecretCharsetMode): string {
  return mode === "enhanced" ? ENHANCED_CHARS : STANDARD_CHARS;
}

/** Draws one unbiased index in [0, charsetSize) via rejection sampling. */
function randomIndex(charsetSize: number): number {
  const maxUnbiased = Math.floor(0x100000000 / charsetSize) * charsetSize;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= maxUnbiased);
  return value % charsetSize;
}

export function generateHmacSecret(bits: number, mode: SecretCharsetMode): string {
  const clampedBits = Math.min(SECRET_BITS_MAX, Math.max(SECRET_BITS_MIN, bits));
  const charset = charsetFor(mode);
  const bitsPerChar = Math.log2(charset.length);
  const charCount = Math.ceil(clampedBits / bitsPerChar);

  let secret = "";
  for (let i = 0; i < charCount; i++) {
    secret += charset[randomIndex(charset.length)];
  }
  return secret;
}
