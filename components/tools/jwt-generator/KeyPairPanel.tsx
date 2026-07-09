"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { Callout } from "@/components/ui/Callout";
import { toggleButtonClasses } from "@/components/ui/formClasses";
import { exportKeyPairPem, generateAsymmetricKeyPair, importPrivateKeyPem, importPublicKeyPem } from "@/lib/jwt/asymmetric";
import { JoseAlg } from "@/lib/jwt/algorithms";
import { maskPem } from "@/lib/jwt/mask";

export interface AsymmetricKeyMaterial {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicPem: string;
  privatePem: string;
}

/** A CryptoKey's hash/curve is bound at generate/import time and can't be swapped — the
 *  parent must render this with `key={alg}` so a change in algorithm remounts a fresh
 *  instance (empty PEM fields, no stale key material) instead of reusing one across algs. */
export function KeyPairPanel({
  alg,
  onKeysChange,
  sensitiveVisible,
  onToggleSensitiveVisible,
}: {
  alg: JoseAlg;
  onKeysChange: (keys: AsymmetricKeyMaterial | null) => void;
  sensitiveVisible: boolean;
  onToggleSensitiveVisible: () => void;
}) {
  const [mode, setMode] = useState<"generate" | "paste">("generate");
  const [publicPem, setPublicPem] = useState("");
  const [privatePem, setPrivatePem] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const keyPair = await generateAsymmetricKeyPair(alg);
      const pems = await exportKeyPairPem(keyPair);
      setPublicPem(pems.publicPem);
      setPrivatePem(pems.privatePem);
      onKeysChange({ privateKey: keyPair.privateKey, publicKey: keyPair.publicKey, ...pems });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a keypair");
      onKeysChange(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleUsePasted() {
    setError(null);
    setLoading(true);
    try {
      const [privateKey, publicKey] = await Promise.all([
        importPrivateKeyPem(privatePem, alg),
        importPublicKeyPem(publicPem, alg),
      ]);
      onKeysChange({ privateKey, publicKey, publicPem, privatePem });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import the pasted PEM key(s)");
      onKeysChange(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="flex items-center gap-2">
        <button type="button" className={toggleButtonClasses(mode === "generate")} onClick={() => setMode("generate")}>
          Generate keypair
        </button>
        <button type="button" className={toggleButtonClasses(mode === "paste")} onClick={() => setMode("paste")}>
          Paste existing PEM
        </button>
      </div>

      {mode === "generate" ? (
        <button type="button" disabled={loading} className={toggleButtonClasses(false)} onClick={handleGenerate}>
          {loading ? "Generating…" : `Generate ${alg} keypair`}
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Public key (PEM, SPKI)</label>
            <textarea
              value={publicPem}
              onChange={(e) => setPublicPem(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder="-----BEGIN PUBLIC KEY-----"
              className="w-full rounded border border-zinc-300 bg-white p-2 font-mono text-xs break-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Private key (PEM, PKCS#8)</label>
            <textarea
              value={privatePem}
              onChange={(e) => setPrivatePem(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder="-----BEGIN PRIVATE KEY-----"
              className="w-full rounded border border-zinc-300 bg-white p-2 font-mono text-xs break-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            disabled={loading || !publicPem || !privatePem}
            className={`${toggleButtonClasses(false)} sm:col-span-2`}
            onClick={handleUsePasted}
          >
            {loading ? "Importing…" : "Use pasted keys"}
          </button>
        </div>
      )}

      {error && <Callout variant="danger">{error}</Callout>}

      {publicPem && privatePem && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium">Public key</label>
              <CopyButton text={publicPem} />
            </div>
            <pre className="max-h-32 overflow-auto rounded bg-zinc-50 p-2 text-xs break-all whitespace-pre-wrap dark:bg-zinc-900">
              {publicPem}
            </pre>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-xs font-medium">Private key</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`}
                  onClick={onToggleSensitiveVisible}
                >
                  {sensitiveVisible ? "Hide" : "Show"}
                </button>
                <CopyButton text={privatePem} />
              </div>
            </div>
            <pre className="max-h-32 overflow-auto rounded bg-zinc-50 p-2 text-xs break-all whitespace-pre-wrap dark:bg-zinc-900">
              {sensitiveVisible ? privatePem : maskPem(privatePem)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
