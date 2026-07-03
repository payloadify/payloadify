"use client";

import { useId, useState } from "react";

export function Tooltip({ text, label = "More info" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-400 text-[10px] leading-none text-zinc-500 hover:border-zinc-600 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-300"
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-1 w-56 -translate-x-1/2 rounded border border-zinc-300 bg-white p-2 text-xs text-zinc-700 shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {text}
        </span>
      )}
    </span>
  );
}
