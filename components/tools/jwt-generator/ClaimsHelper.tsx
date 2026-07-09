"use client";

import { useState } from "react";
import { inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { applyQuickClaim, formatRelativeFromNow, QuickClaimKey, toNumericDate } from "@/lib/jwt/claims";

function TimeClaimField({
  label,
  onSetNow,
  onSetDate,
}: {
  label: string;
  onSetNow: () => void;
  onSetDate: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="w-8 text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        <button type="button" className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`} onClick={onSetNow}>
          Now
        </button>
      </div>
      <input
        type="datetime-local"
        onChange={(e) => onSetDate(e.target.value)}
        // The native calendar/clock picker icon follows `color-scheme`, not `color` — without
        // this it renders as a near-invisible dark icon on the dark theme's dark input background.
        className={`${inputClasses} px-2 py-1 text-xs [color-scheme:light] dark:[color-scheme:dark]`}
      />
    </div>
  );
}

export function ClaimsHelper({ payloadJson, onChange }: { payloadJson: string; onChange: (json: string) => void }) {
  const [issValue, setIssValue] = useState("https://issuer.example.com");
  const [subValue, setSubValue] = useState("user-1234");
  const [audValue, setAudValue] = useState("https://api.example.com");

  function addTextClaim(key: QuickClaimKey, value: string) {
    if (!value.trim()) return;
    try {
      onChange(applyQuickClaim(payloadJson, key, value));
    } catch {
      // Payload JSON is currently malformed — JsonEditor's own error display covers this.
    }
  }

  function addTimeClaim(key: QuickClaimKey, offsetSeconds: number) {
    try {
      onChange(applyQuickClaim(payloadJson, key, toNumericDate(new Date()) + offsetSeconds));
    } catch {
      // Payload JSON is currently malformed — JsonEditor's own error display covers this.
    }
  }

  function addTimeClaimFromPicker(key: QuickClaimKey, datetimeLocalValue: string) {
    if (!datetimeLocalValue) return;
    try {
      onChange(applyQuickClaim(payloadJson, key, toNumericDate(new Date(datetimeLocalValue))));
    } catch {
      // Payload JSON is currently malformed — JsonEditor's own error display covers this.
    }
  }

  function addJti() {
    try {
      onChange(applyQuickClaim(payloadJson, "jti", crypto.randomUUID()));
    } catch {
      // Payload JSON is currently malformed — JsonEditor's own error display covers this.
    }
  }

  let expReadout: string | null = null;
  try {
    const parsed = JSON.parse(payloadJson || "{}");
    if (typeof parsed.exp === "number") expReadout = formatRelativeFromNow(parsed.exp);
  } catch {
    // Payload JSON is currently malformed — no readout, JsonEditor shows the error.
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Quick-add claims</div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="flex gap-1">
          <input
            className={`${inputClasses} px-2 py-1 text-xs`}
            value={issValue}
            onChange={(e) => setIssValue(e.target.value)}
            placeholder="iss"
          />
          <button type="button" className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`} onClick={() => addTextClaim("iss", issValue)}>
            + iss
          </button>
        </div>
        <div className="flex gap-1">
          <input
            className={`${inputClasses} px-2 py-1 text-xs`}
            value={subValue}
            onChange={(e) => setSubValue(e.target.value)}
            placeholder="sub"
          />
          <button type="button" className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`} onClick={() => addTextClaim("sub", subValue)}>
            + sub
          </button>
        </div>
        <div className="flex gap-1">
          <input
            className={`${inputClasses} px-2 py-1 text-xs`}
            value={audValue}
            onChange={(e) => setAudValue(e.target.value)}
            placeholder="aud"
          />
          <button type="button" className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`} onClick={() => addTextClaim("aud", audValue)}>
            + aud
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TimeClaimField label="iat" onSetNow={() => addTimeClaim("iat", 0)} onSetDate={(v) => addTimeClaimFromPicker("iat", v)} />
        <TimeClaimField label="exp" onSetNow={() => addTimeClaim("exp", 3600)} onSetDate={(v) => addTimeClaimFromPicker("exp", v)} />
        <TimeClaimField label="nbf" onSetNow={() => addTimeClaim("nbf", 0)} onSetDate={(v) => addTimeClaimFromPicker("nbf", v)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`} onClick={addJti}>
          + jti (random UUID)
        </button>
        {expReadout && <span className="text-xs text-zinc-500 dark:text-zinc-400">{expReadout}</span>}
      </div>
    </div>
  );
}
