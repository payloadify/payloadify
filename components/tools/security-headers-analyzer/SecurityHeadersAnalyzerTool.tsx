"use client";

import { useState } from "react";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { Callout } from "@/components/ui/Callout";
import { ReferencesPanel } from "@/components/ui/ReferencesPanel";
import { CopyField } from "@/lib/copyFormat";
import { apiGet } from "@/lib/net/apiClient";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { SecurityHeadersResponse } from "@/lib/security-headers/types";
import { CachedResultBanner } from "@/components/tools/analyzer-shared/CachedResultBanner";
import { CopyAllPanel } from "./CopyAllPanel";
import { FindingsList } from "./FindingsList";
import { RawHeadersPanel } from "./RawHeadersPanel";
import { SummaryBar } from "./SummaryBar";
import { UrlInputForm } from "./UrlInputForm";
import { headerStatusLabel } from "./statusClasses";

const HISTORY_KEY = "payloadify:security-headers-analyzer:history";
const REFERENCES_COLLAPSED_KEY = "payloadify:security-headers-analyzer:references-collapsed";

const REFERENCES = [
  { id: "owasp-secure-headers", label: "OWASP Secure Headers Project", url: "https://owasp.org/www-project-secure-headers/", source: "OWASP" },
  { id: "mdn-http-headers", label: "HTTP headers reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers", source: "MDN" },
];

export function SecurityHeadersAnalyzerTool() {
  const [rawUrl, setRawUrl] = useState("");
  const [data, setData] = useState<SecurityHeadersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { blockedMsg: blockedMessage, setBlockedMsg: setBlockedMessage, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  async function analyze(forceFresh: boolean) {
    if (!rawUrl.trim()) return;
    const check = checkAndClear();
    if (!check.allowed) return;

    setLoading(true);
    setError(null);

    const path = `/api/security-headers?url=${encodeURIComponent(rawUrl.trim())}${forceFresh ? "&fresh=1" : ""}`;
    const result = await apiGet<SecurityHeadersResponse>(path);

    if (result.ok) {
      setData(result.data);
      recordGeneration(check.now);
    } else {
      setError(result.error);
      setData(null);
    }
    setLoading(false);
  }

  const copyFields: CopyField[] = data
    ? data.findings.map((f) => ({
        id: f.id,
        label: f.label,
        value: `${f.label}: ${headerStatusLabel(f)} — ${f.detail}`,
        url: f.owaspUrl,
      }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice subject="systems" />

      <UrlInputForm
        url={rawUrl}
        onUrlChange={setRawUrl}
        onSubmit={() => analyze(false)}
        loading={loading}
        disabled={!rawUrl.trim()}
        blockedMessage={blockedMessage}
      />

      {error && (
        <Callout variant="danger">
          {error}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setBlockedMessage(null);
            }}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </Callout>
      )}

      {data && (
        <>
          {data.cached && <CachedResultBanner onForceFresh={() => analyze(true)} loading={loading} />}
          <SummaryBar data={data} />
          <FindingsList findings={data.findings} />
          <RawHeadersPanel rawHeaders={data.rawHeaders} />
          <CopyAllPanel fields={copyFields} />
        </>
      )}

      <ReferencesPanel references={REFERENCES} storageKey={REFERENCES_COLLAPSED_KEY} />
    </div>
  );
}
