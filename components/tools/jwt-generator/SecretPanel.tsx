"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { inputClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import {
  generateHmacSecret,
  SECRET_BIT_PRESETS,
  SECRET_BITS_DEFAULT,
  SECRET_BITS_MAX,
  SECRET_BITS_MIN,
  SecretCharsetMode,
} from "@/lib/jwt/secretGenerator";
import { maskMiddle } from "@/lib/jwt/mask";

export function SecretPanel({
  secret,
  onChange,
  sensitiveVisible,
  onToggleSensitiveVisible,
}: {
  secret: string;
  onChange: (secret: string) => void;
  sensitiveVisible: boolean;
  onToggleSensitiveVisible: () => void;
}) {
  const [mode, setMode] = useState<SecretCharsetMode>("standard");
  const [bits, setBits] = useState(SECRET_BITS_DEFAULT);
  // Reveal the real value while actively typing/editing, regardless of the global toggle —
  // masking a field the user is currently focused in would corrupt what they see as they type.
  const [focused, setFocused] = useState(false);
  const revealed = sensitiveVisible || focused;

  function generateAtStrength(targetBits: number) {
    setBits(targetBits);
    onChange(generateHmacSecret(targetBits, mode));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">HMAC secret</label>
        <button type="button" className={`${toggleButtonClasses(false)} px-2 py-1 text-xs`} onClick={onToggleSensitiveVisible}>
          {sensitiveVisible ? "Hide" : "Show"}
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={revealed ? secret : maskMiddle(secret)}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type a secret, or generate one below"
          spellCheck={false}
          autoComplete="off"
          className={`${inputClasses} flex-1`}
        />
        <CopyButton text={secret} disabled={!secret} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded border border-zinc-300 p-2 dark:border-zinc-700">
        <button type="button" className={toggleButtonClasses(mode === "standard")} onClick={() => setMode("standard")}>
          Standard
        </button>
        <button type="button" className={toggleButtonClasses(mode === "enhanced")} onClick={() => setMode("enhanced")}>
          Enhanced
        </button>
        <label className="ml-1 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          Strength
          <input
            type="range"
            min={SECRET_BITS_MIN}
            max={SECRET_BITS_MAX}
            step={8}
            value={bits}
            onChange={(e) => setBits(Number(e.target.value))}
          />
          {bits} bits
        </label>
        <button type="button" className={toggleButtonClasses(false)} onClick={() => generateAtStrength(bits)}>
          Generate random secret
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Quick strength:</span>
        {SECRET_BIT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`${toggleButtonClasses(bits === preset)} px-2 py-1 text-xs`}
            onClick={() => generateAtStrength(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Standard = letters + numbers only. Enhanced = adds special characters. Strength sets the generated secret&apos;s
        target entropy (default 256 bits). Only the start/end are shown by default — click into the field or use
        &quot;Show&quot; above to see it in full.
      </p>
    </div>
  );
}
