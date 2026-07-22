"use client";

import { ReactNode, useState } from "react";

/** Renders a raw record value with a toggle between horizontal-scroll (default, like VS Code with
 *  word wrap off) and wrapped-in-place (like VS Code's "Toggle Word Wrap" / Alt+Z) — long single-line
 *  values (e.g. a DKIM public key) would otherwise overflow their container's width.
 *  `extraControls` is an optional slot for caller-specific buttons rendered next to "Wrap" (e.g.
 *  the CVSS calculator's "Labels" toggle) — left unset, other callers are unaffected. */
export function WrappableCode({ text, extraControls }: { text: string; extraControls?: ReactNode }) {
  const [wrap, setWrap] = useState(true);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center justify-end gap-2">
        {extraControls}
        <button
          type="button"
          onClick={() => setWrap(!wrap)}
          className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
        >
          {wrap ? "No wrap" : "Wrap"}
        </button>
      </div>
      <code
        className={`block rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900 ${
          wrap ? "whitespace-pre-wrap break-all" : "overflow-x-auto whitespace-pre"
        }`}
      >
        {text}
      </code>
    </div>
  );
}
