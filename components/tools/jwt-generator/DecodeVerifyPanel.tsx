"use client";

import { useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { decodeJwt } from "@/lib/jwt/jwt";
import { verifyHmac } from "@/lib/jwt/hmac";
import { importPublicKeyPem, verifyAsymmetric } from "@/lib/jwt/asymmetric";
import { ALGORITHMS, JoseAlg } from "@/lib/jwt/algorithms";

export function DecodeVerifyPanel({
  onLoadIntoGenerator,
}: {
  onLoadIntoGenerator: (params: { alg: JoseAlg; headerJson: string; payloadJson: string }) => void;
}) {
  const [rawToken, setRawToken] = useState("");
  const [verifyKey, setVerifyKey] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "error">("idle");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const decoded = rawToken.trim() ? decodeJwt(rawToken) : null;
  const decodedOk = decoded && !("error" in decoded) ? decoded : null;
  const alg = decodedOk?.alg as JoseAlg | null;
  const algSpec = alg && alg in ALGORITHMS ? ALGORITHMS[alg] : null;

  async function handleVerify() {
    if (!decodedOk || !algSpec) return;
    setVerifyStatus("checking");
    setVerifyError(null);
    try {
      let ok: boolean;
      if (algSpec.family === "hmac") {
        ok = await verifyHmac(algSpec.alg as "HS256" | "HS384" | "HS512", decodedOk, verifyKey);
      } else if (algSpec.family === "none") {
        setVerifyError("alg:none tokens have no signature to verify.");
        setVerifyStatus("idle");
        return;
      } else {
        const publicKey = await importPublicKeyPem(verifyKey, algSpec.alg);
        ok = await verifyAsymmetric(algSpec.alg, decodedOk, publicKey);
      }
      setVerifyStatus(ok ? "valid" : "invalid");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Could not verify with the supplied key");
      setVerifyStatus("error");
    }
  }

  function handleLoad() {
    if (!decodedOk || !alg) return;
    onLoadIntoGenerator({
      alg,
      headerJson: decodedOk.header.json !== null ? JSON.stringify(decodedOk.header.json, null, 2) : (decodedOk.header.text ?? ""),
      payloadJson:
        decodedOk.payload.json !== null ? JSON.stringify(decodedOk.payload.json, null, 2) : (decodedOk.payload.text ?? ""),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Decode &amp; verify an existing token</div>
      <textarea
        value={rawToken}
        onChange={(e) => {
          setRawToken(e.target.value);
          setVerifyStatus("idle");
          setVerifyError(null);
        }}
        rows={3}
        spellCheck={false}
        placeholder="Paste a JWT (header.payload.signature)"
        className="w-full rounded border border-zinc-300 bg-white p-2 font-mono text-xs break-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      {decoded && "error" in decoded && <Callout variant="danger">{decoded.error}</Callout>}

      {decodedOk && algSpec && (
        <>
          {algSpec.family !== "none" && (
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyKey}
                onChange={(e) => setVerifyKey(e.target.value)}
                placeholder={algSpec.family === "hmac" ? "HMAC secret" : "Public key (PEM, SPKI)"}
                className={`${inputClasses} flex-1`}
              />
              <button type="button" className={toggleButtonClasses(false)} onClick={handleVerify}>
                Verify
              </button>
            </div>
          )}
          {verifyStatus === "valid" && <Callout variant="success">Signature is valid for this key.</Callout>}
          {verifyStatus === "invalid" && <Callout variant="danger">Signature does not match this key.</Callout>}
          {verifyError && <Callout variant="warning">{verifyError}</Callout>}

          <button type="button" className={toggleButtonClasses(false)} onClick={handleLoad}>
            Load into generator (edit + re-sign)
          </button>
        </>
      )}
    </div>
  );
}
