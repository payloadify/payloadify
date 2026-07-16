"use client";

import { useState } from "react";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { Callout } from "@/components/ui/Callout";
import { ReferencesPanel } from "@/components/ui/ReferencesPanel";
import { CopyField } from "@/lib/copyFormat";
import { apiGet } from "@/lib/net/apiClient";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";
import { EmailAuthResponse } from "@/lib/email-auth/types";
import { CachedResultBanner } from "@/components/tools/analyzer-shared/CachedResultBanner";
import { CopyAllPanel } from "./CopyAllPanel";
import { DomainAndSelectorInput } from "./DomainAndSelectorInput";
import { SpfResultPanel } from "./SpfResultPanel";
import { DkimResultPanel } from "./DkimResultPanel";
import { DmarcResultPanel } from "./DmarcResultPanel";

const HISTORY_KEY = "payloadify:spf-dkim-dmarc-checker:history";
const REFERENCES_COLLAPSED_KEY = "payloadify:spf-dkim-dmarc-checker:references-collapsed";

const REFERENCES = [
  { id: "rfc7208", label: "RFC 7208 — Sender Policy Framework (SPF)", url: "https://www.rfc-editor.org/rfc/rfc7208", source: "IETF" },
  { id: "rfc6376", label: "RFC 6376 — DomainKeys Identified Mail (DKIM)", url: "https://www.rfc-editor.org/rfc/rfc6376", source: "IETF" },
  { id: "rfc7489", label: "RFC 7489 — Domain-based Message Authentication (DMARC)", url: "https://www.rfc-editor.org/rfc/rfc7489", source: "IETF" },
  { id: "dmarc-org", label: "dmarc.org — overview and FAQ", url: "https://dmarc.org/overview/", source: "dmarc.org" },
];

export function SpfDkimDmarcCheckerTool() {
  const [rawDomain, setRawDomain] = useState("");
  const [selector, setSelector] = useState("");
  const [data, setData] = useState<EmailAuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { blockedMsg: blockedMessage, setBlockedMsg: setBlockedMessage, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  async function check(forceFresh: boolean) {
    if (!rawDomain.trim()) return;
    const check = checkAndClear();
    if (!check.allowed) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ domain: rawDomain.trim() });
    if (selector.trim()) params.set("selector", selector.trim());
    if (forceFresh) params.set("fresh", "1");

    const result = await apiGet<EmailAuthResponse>(`/api/email-auth?${params.toString()}`);

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
    ? [
        {
          id: "spf",
          label: "SPF",
          value: data.spf.record ? `SPF: ${data.spf.record}` : "SPF: not found.",
        },
        {
          id: "dmarc",
          label: "DMARC",
          value: data.dmarc.record ? `DMARC: ${data.dmarc.record}` : "DMARC: not found.",
        },
        ...data.dkim
          .filter((r) => r.found)
          .map((r) => ({
            id: `dkim-${r.selector}`,
            label: `DKIM (${r.selector})`,
            value: `DKIM (${r.selector}): ${r.record}`,
          })),
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice subject="domains" />

      <DomainAndSelectorInput
        domain={rawDomain}
        onDomainChange={setRawDomain}
        selector={selector}
        onSelectorChange={setSelector}
        onSubmit={() => check(false)}
        loading={loading}
        disabled={!rawDomain.trim()}
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
          {data.cached && <CachedResultBanner onForceFresh={() => check(true)} loading={loading} />}
          <SpfResultPanel spf={data.spf} />
          <DmarcResultPanel dmarc={data.dmarc} />
          <DkimResultPanel dkim={data.dkim} selectorsChecked={data.dkimSelectorsChecked} />
          <CopyAllPanel fields={copyFields} />
        </>
      )}

      <ReferencesPanel references={REFERENCES} storageKey={REFERENCES_COLLAPSED_KEY} />
    </div>
  );
}
