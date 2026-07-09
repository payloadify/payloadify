"use client";

import { useCallback, useEffect, useState } from "react";
import { Callout } from "@/components/ui/Callout";
import { JsonEditor } from "@/components/ui/JsonEditor";
import { toggleButtonClasses } from "@/components/ui/formClasses";
import { CopyField } from "@payloadify/cvss-core";
import { AlgorithmPicker } from "./AlgorithmPicker";
import { ClaimsHelper } from "./ClaimsHelper";
import { SecretPanel } from "./SecretPanel";
import { AsymmetricKeyMaterial, KeyPairPanel } from "./KeyPairPanel";
import { OutputPanel } from "./OutputPanel";
import { WeaknessFlags } from "./WeaknessFlags";
import { PresetPicker } from "./PresetPicker";
import { ReferencesPanel } from "./ReferencesPanel";
import { CopyAllPanel } from "./CopyAllPanel";
import { DecodeVerifyPanel } from "./DecodeVerifyPanel";
import { WalkthroughGuide } from "./WalkthroughGuide";
import { ALGORITHMS, JoseAlg } from "@/lib/jwt/algorithms";
import { applyAlgToHeaderJson, toNumericDate } from "@/lib/jwt/claims";
import { buildAndSignToken, SigningKeyMaterial } from "@/lib/jwt/generate";
import { computeGeneratorWeaknessFlags } from "@/lib/jwt/weaknessFlags";
import { getPreset } from "@/lib/jwt/presets";
import { WALKTHROUGH_STEPS } from "@/lib/jwt/walkthroughSteps";

const DEFAULT_ALG: JoseAlg = "HS256";

function sectionId(id: string): string {
  return `jwt-gen-section-${id}`;
}

function defaultHeaderJson(alg: JoseAlg): string {
  return applyAlgToHeaderJson("", alg);
}

function defaultPayloadJson(): string {
  const now = toNumericDate(new Date());
  return JSON.stringify({ sub: "user-1234", iat: now, exp: now + 3600 }, null, 2);
}

export function JwtGeneratorTool() {
  const [alg, setAlg] = useState<JoseAlg>(DEFAULT_ALG);
  const [headerJson, setHeaderJson] = useState(() => defaultHeaderJson(DEFAULT_ALG));
  const [payloadJson, setPayloadJson] = useState(() => defaultPayloadJson());
  const [hmacSecret, setHmacSecret] = useState("");
  const [asymmetricKeys, setAsymmetricKeys] = useState<AsymmetricKeyMaterial | null>(null);
  const [outputToken, setOutputToken] = useState("");
  const [outputError, setOutputError] = useState<string | null>(null);
  // Secrets/keys default to hidden on screen; deliberately plain component state (not
  // persisted) so a page refresh always re-hides them.
  const [sensitiveVisible, setSensitiveVisible] = useState(false);
  const [walkthroughStepIndex, setWalkthroughStepIndex] = useState<number | null>(null);

  const spec = ALGORITHMS[alg];
  const walkthroughStep = walkthroughStepIndex !== null ? WALKTHROUGH_STEPS[walkthroughStepIndex] : null;

  useEffect(() => {
    if (!walkthroughStep?.targetId) return;
    const el = document.getElementById(sectionId(walkthroughStep.targetId));
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [walkthroughStep]);

  function highlightClass(id: string): string {
    return walkthroughStep?.targetId === id
      ? "rounded-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-white transition dark:ring-offset-zinc-950"
      : "";
  }

  function handleAlgChange(newAlg: JoseAlg) {
    setAlg(newAlg);
    setHeaderJson((prev) => {
      try {
        return applyAlgToHeaderJson(prev, newAlg);
      } catch {
        return defaultHeaderJson(newAlg);
      }
    });
    setAsymmetricKeys(null);
  }

  const handleAsymmetricKeysChange = useCallback((keys: AsymmetricKeyMaterial | null) => {
    setAsymmetricKeys(keys);
  }, []);

  function applyPreset(presetId: string) {
    const preset = getPreset(presetId);
    if (!preset) return;
    const now = toNumericDate(new Date());
    setAlg(preset.alg);
    setHeaderJson(JSON.stringify(preset.buildHeader(), null, 2));
    setPayloadJson(JSON.stringify(preset.buildPayload(now), null, 2));
    setAsymmetricKeys(null);
  }

  function loadDecodedToken({
    alg: newAlg,
    headerJson: h,
    payloadJson: p,
  }: {
    alg: JoseAlg;
    headerJson: string;
    payloadJson: string;
  }) {
    setAlg(newAlg);
    setHeaderJson(h);
    setPayloadJson(p);
    setAsymmetricKeys(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function sign() {
      let keyMaterial: SigningKeyMaterial;
      if (spec.family === "none") {
        keyMaterial = { kind: "none" };
      } else if (spec.family === "hmac") {
        if (!hmacSecret) {
          if (!cancelled) {
            setOutputToken("");
            setOutputError(null);
          }
          return;
        }
        keyMaterial = { kind: "hmac", secret: hmacSecret };
      } else {
        if (!asymmetricKeys) {
          if (!cancelled) {
            setOutputToken("");
            setOutputError(null);
          }
          return;
        }
        keyMaterial = { kind: "asymmetric", privateKey: asymmetricKeys.privateKey };
      }

      try {
        const token = await buildAndSignToken(headerJson, payloadJson, alg, keyMaterial);
        if (!cancelled) {
          setOutputToken(token);
          setOutputError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setOutputToken("");
          setOutputError(err instanceof Error ? err.message : "Could not build/sign the token");
        }
      }
    }

    sign();
    return () => {
      cancelled = true;
    };
  }, [alg, headerJson, payloadJson, hmacSecret, asymmetricKeys, spec.family]);

  let parsedHeader: Record<string, unknown> | null = null;
  let parsedPayload: Record<string, unknown> | null = null;
  try {
    parsedHeader = JSON.parse(headerJson || "{}");
  } catch {
    // JsonEditor shows its own parse error for the header field.
  }
  try {
    parsedPayload = JSON.parse(payloadJson || "{}");
  } catch {
    // JsonEditor shows its own parse error for the payload field.
  }

  const flags = computeGeneratorWeaknessFlags({ alg, header: parsedHeader, payload: parsedPayload, hmacSecret });

  const copyFields: CopyField[] = [
    ...(outputToken ? [{ id: "token", label: "Token", value: outputToken }] : []),
    { id: "header", label: "Header", value: headerJson },
    { id: "payload", label: "Payload", value: payloadJson },
    ...(outputToken ? [{ id: "signature", label: "Signature", value: outputToken.split(".")[2] ?? "" }] : []),
    ...(spec.family === "hmac" && hmacSecret ? [{ id: "secret", label: "Secret", value: hmacSecret }] : []),
    ...(asymmetricKeys ? [{ id: "publicKey", label: "Public key", value: asymmetricKeys.publicPem }] : []),
    ...(asymmetricKeys ? [{ id: "privateKey", label: "Private key", value: asymmetricKeys.privatePem }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Callout variant="warning">Use only on systems you own or are explicitly authorized to test.</Callout>
        <button type="button" className={toggleButtonClasses(false)} onClick={() => setWalkthroughStepIndex(0)}>
          Walkthrough
        </button>
      </div>

      <div id={sectionId("presets")} className={highlightClass("presets")}>
        <PresetPicker onApply={applyPreset} />
      </div>

      <div id={sectionId("algorithm")} className={highlightClass("algorithm")}>
        <AlgorithmPicker alg={alg} onChange={handleAlgChange} />
      </div>

      <div id={sectionId("keys")} className={highlightClass("keys")}>
        {spec.family === "hmac" && (
          <SecretPanel
            secret={hmacSecret}
            onChange={setHmacSecret}
            sensitiveVisible={sensitiveVisible}
            onToggleSensitiveVisible={() => setSensitiveVisible((v) => !v)}
          />
        )}
        {(spec.family === "rsa" || spec.family === "ec" || spec.family === "rsa-pss") && (
          <KeyPairPanel
            key={alg}
            alg={alg}
            onKeysChange={handleAsymmetricKeysChange}
            sensitiveVisible={sensitiveVisible}
            onToggleSensitiveVisible={() => setSensitiveVisible((v) => !v)}
          />
        )}
      </div>

      <div id={sectionId("editors")} className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${highlightClass("editors")}`}>
        <JsonEditor label="Header" value={headerJson} onChange={setHeaderJson} />
        <JsonEditor label="Payload" value={payloadJson} onChange={setPayloadJson} />
      </div>

      <div id={sectionId("claims")} className={highlightClass("claims")}>
        <ClaimsHelper payloadJson={payloadJson} onChange={setPayloadJson} />
      </div>

      <div id={sectionId("flags")} className={highlightClass("flags")}>
        <WeaknessFlags flags={flags} />
        {walkthroughStep?.targetId === "flags" && flags.length === 0 && (
          <p className="text-xs text-zinc-500 italic dark:text-zinc-400">
            No warnings right now — this area only appears when something looks risky.
          </p>
        )}
      </div>

      <div id={sectionId("output")} className={highlightClass("output")}>
        <OutputPanel token={outputToken} error={outputError} />
      </div>

      {copyFields.length > 0 && <CopyAllPanel fields={copyFields} sensitiveVisible={sensitiveVisible} />}

      <DecodeVerifyPanel onLoadIntoGenerator={loadDecodedToken} />

      <ReferencesPanel />

      {walkthroughStep && (
        <WalkthroughGuide
          step={walkthroughStep}
          stepIndex={walkthroughStepIndex!}
          totalSteps={WALKTHROUGH_STEPS.length}
          onNext={() =>
            setWalkthroughStepIndex((i) => (i === null ? null : Math.min(i + 1, WALKTHROUGH_STEPS.length - 1)))
          }
          onBack={() => setWalkthroughStepIndex((i) => (i === null ? null : Math.max(i - 1, 0)))}
          onClose={() => setWalkthroughStepIndex(null)}
        />
      )}
    </div>
  );
}
