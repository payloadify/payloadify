"use client";

import { useEffect, useMemo, useState } from "react";
import { JsonEditor } from "@/components/ui/JsonEditor";
import { Callout } from "@/components/ui/Callout";
import { decodeJwt, findWeakSecret } from "@/lib/jwt/jwt";
import { WarningsBanner } from "./WarningsBanner";
import { SignaturePanel } from "./SignaturePanel";
import { ReferencesPanel } from "@/components/tools/jwt-shared/ReferencesPanel";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function JwtDecoderTool() {
  const [rawToken, setRawToken] = useState(SAMPLE_TOKEN);
  const [lastSyncedToken, setLastSyncedToken] = useState<string | null>(null);
  const [headerJson, setHeaderJson] = useState("");
  const [payloadJson, setPayloadJson] = useState("");
  const [weakSecret, setWeakSecret] = useState<string | null>(null);

  const decoded = useMemo(() => decodeJwt(rawToken), [rawToken]);

  // Re-sync the editable header/payload text whenever a *new* token is pasted,
  // without clobbering in-progress edits on every render (React's recommended
  // "adjust state during render" pattern instead of an effect).
  if (rawToken !== lastSyncedToken) {
    setLastSyncedToken(rawToken);
    setWeakSecret(null);
    if (!("error" in decoded)) {
      setHeaderJson(
        decoded.header.json !== null ? JSON.stringify(decoded.header.json, null, 2) : (decoded.header.text ?? ""),
      );
      setPayloadJson(
        decoded.payload.json !== null
          ? JSON.stringify(decoded.payload.json, null, 2)
          : (decoded.payload.text ?? ""),
      );
    }
  }

  useEffect(() => {
    if ("error" in decoded) return;
    let cancelled = false;
    findWeakSecret(decoded).then((result) => {
      if (!cancelled) setWeakSecret(result);
    });
    return () => {
      cancelled = true;
    };
  }, [decoded]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">JWT</label>
        <textarea
          value={rawToken}
          onChange={(e) => setRawToken(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="Paste a JWT (header.payload.signature)"
          className="w-full rounded border border-zinc-300 bg-white p-3 font-mono text-xs break-all outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {"error" in decoded ? (
        <Callout variant="danger">{decoded.error}</Callout>
      ) : (
        <>
          <WarningsBanner decoded={decoded} weakSecret={weakSecret} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <JsonEditor
              label="Header"
              value={headerJson}
              onChange={setHeaderJson}
              error={decoded.header.error}
            />
            <JsonEditor
              label="Payload"
              value={payloadJson}
              onChange={setPayloadJson}
              error={decoded.payload.error}
            />
          </div>

          <SignaturePanel key={rawToken} decoded={decoded} headerJson={headerJson} payloadJson={payloadJson} />
        </>
      )}

      <ReferencesPanel />
    </div>
  );
}
