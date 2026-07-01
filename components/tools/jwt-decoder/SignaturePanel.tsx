"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { Callout } from "@/components/ui/Callout";
import { DecodedJwt, reSignHS256, stripToAlgNone, verifyHS256 } from "@/lib/jwt/jwt";

export function SignaturePanel({
  decoded,
  headerJson,
  payloadJson,
}: {
  decoded: DecodedJwt;
  headerJson: string;
  payloadJson: string;
}) {
  const [secret, setSecret] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [outputToken, setOutputToken] = useState("");
  const [outputError, setOutputError] = useState<string | null>(null);

  async function handleVerify() {
    setVerifyStatus("checking");
    const ok = await verifyHS256(decoded, secret);
    setVerifyStatus(ok ? "valid" : "invalid");
  }

  async function handleReSign() {
    setOutputError(null);
    try {
      const token = await reSignHS256(headerJson, payloadJson, secret);
      setOutputToken(token);
    } catch {
      setOutputError("Header/payload must be valid JSON before re-signing");
    }
  }

  function handleStripToNone() {
    setOutputError(null);
    try {
      setOutputToken(stripToAlgNone(headerJson, payloadJson));
    } catch {
      setOutputError("Header/payload must be valid JSON before exporting");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Secret {decoded.alg ? `(for HS* algorithms — current alg: ${decoded.alg})` : ""}
        </label>
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="e.g. your-256-bit-secret"
          className="w-full rounded border border-zinc-300 bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleVerify}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Verify with secret
        </button>
        <button
          type="button"
          onClick={handleReSign}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:border-zinc-400 dark:border-zinc-700"
        >
          Re-sign as HS256
        </button>
        <button
          type="button"
          onClick={handleStripToNone}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:border-zinc-400 dark:border-zinc-700"
        >
          Strip to alg:none
        </button>
      </div>

      {verifyStatus === "valid" && <Callout variant="success">Signature is valid for this secret.</Callout>}
      {verifyStatus === "invalid" && <Callout variant="danger">Signature does not match this secret.</Callout>}

      {outputError && <Callout variant="danger">{outputError}</Callout>}

      {outputToken && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">Output token</label>
            <CopyButton text={outputToken} />
          </div>
          <textarea
            readOnly
            value={outputToken}
            rows={4}
            className="w-full rounded border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs break-all dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}
    </div>
  );
}
