"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { WrappableCode } from "@/components/ui/WrappableCode";
import { DkimSelectorResult } from "@/lib/email-auth/types";

export function DkimResultPanel({ dkim, selectorsChecked }: { dkim: DkimSelectorResult[]; selectorsChecked: number }) {
  const found = dkim.filter((r) => r.found);

  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="font-medium">DKIM</div>

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Checked {selectorsChecked} selector{selectorsChecked === 1 ? "" : "s"} (any you supplied, plus a common-selector list). A
        selector not resolving here is <strong>not proof</strong>{" "}
        that DKIM isn&apos;t configured — the actual selector may just not be on this list.
      </p>

      {found.length === 0 && <p className="text-sm text-zinc-600 dark:text-zinc-400">No DKIM record found at any checked selector.</p>}

      {found.map((r) => {
        const copyText = `DKIM (${r.selector}): ${r.record}`;
        return (
          <div key={r.selector} className="flex flex-col gap-1.5 rounded border border-zinc-200 p-2 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <div className="font-mono text-sm">{r.selector}._domainkey</div>
              <CopyButton text={copyText} label="Copy" />
            </div>
            <WrappableCode text={r.record ?? ""} />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Key type: {r.keyType}
              {r.version && ` · Version: ${r.version}`}
            </p>
            {r.revoked && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Empty public key (&quot;p=&quot;) — this key has been revoked (RFC 6376 §3.6.1). Mail signed with this selector will fail
                verification.
              </p>
            )}
            {!r.revoked && !r.publicKeyPresent && (
              <p className="text-sm text-amber-600 dark:text-amber-400">No public key (&quot;p=&quot;) found in this record.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
