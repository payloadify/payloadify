import { describe, expect, it } from "vitest";
import { NONE_ENCODER, SHELL_ENCODERS_BY_ID } from "./encoders";
import { buildFileBody, buildShell } from "./generate";
import { ShellParams } from "./params";
import { SHELLS_BY_ID } from "./shells";

const PARAMS: ShellParams = { ip: "10.10.10.10", port: 4444, shellPath: "/bin/bash" };

describe("buildShell", () => {
  it("uses render() when encoded is false, even if renderEncoded exists", () => {
    const shell = SHELLS_BY_ID["powershell"];
    const result = buildShell(shell, PARAMS, { encoded: false, encoder: NONE_ENCODER });
    expect(result).toBe(shell.render(PARAMS));
  });

  it("uses renderEncoded() when encoded is true and the variant defines it", () => {
    const shell = SHELLS_BY_ID["powershell"];
    const result = buildShell(shell, PARAMS, { encoded: true, encoder: NONE_ENCODER });
    expect(result).toBe(shell.renderEncoded!(PARAMS));
  });

  it("falls back to render() when encoded is true but the variant has no renderEncoded", () => {
    const shell = SHELLS_BY_ID["bash-dev-tcp"];
    const result = buildShell(shell, PARAMS, { encoded: true, encoder: NONE_ENCODER });
    expect(result).toBe(shell.render(PARAMS));
  });

  it("applies the base64 encoder on top of the rendered payload, round-tripping via atob", () => {
    const shell = SHELLS_BY_ID["bash-dev-tcp"];
    const result = buildShell(shell, PARAMS, { encoded: false, encoder: SHELL_ENCODERS_BY_ID.base64 });
    expect(atob(result)).toBe(shell.render(PARAMS));
  });

  it("applies the URL encoder on top of the rendered payload, round-tripping via decodeURIComponent", () => {
    const shell = SHELLS_BY_ID["bash-dev-tcp"];
    const result = buildShell(shell, PARAMS, { encoded: false, encoder: SHELL_ENCODERS_BY_ID.url });
    expect(decodeURIComponent(result)).toBe(shell.render(PARAMS));
  });
});

describe("buildFileBody", () => {
  it("applies toFileBody when present (shebang prepended for shell-invoked variants)", () => {
    const shell = SHELLS_BY_ID["bash-dev-tcp"];
    const body = buildFileBody(shell, PARAMS);
    expect(body.startsWith("#!/bin/bash\n")).toBe(true);
    expect(body).toContain(shell.render(PARAMS));
  });

  it("produces standalone runnable source for interpreted-language variants, not the packed one-liner", () => {
    const shell = SHELLS_BY_ID["python3"];
    const body = buildFileBody(shell, PARAMS);
    expect(body).not.toContain("python3 -c");
    expect(body).toContain("pty.spawn");
    expect(body).toContain(PARAMS.ip);
  });

  it("always derives the file body from the raw (non-encoded) one-liner", () => {
    const shell = SHELLS_BY_ID["powershell"];
    const body = buildFileBody(shell, PARAMS);
    expect(body).not.toContain("-EncodedCommand");
    expect(body).toContain("TCPClient");
  });
});
