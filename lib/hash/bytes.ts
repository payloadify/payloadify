export function utf8Bytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

/** Windows NTLM hashing operates on the password as UTF-16LE code units, not UTF-8. */
export function utf16leBytes(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < input.length; i++) {
    view.setUint16(i * 2, input.charCodeAt(i), true);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
