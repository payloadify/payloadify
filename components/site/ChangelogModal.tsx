"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { changelogEntries, ChangelogCategory, ChangelogItem } from "@/lib/changelog/entries";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

const CATEGORY_ORDER: ChangelogCategory[] = ["Added", "Improved", "Fixed"];

const CATEGORY_CLASSES: Record<ChangelogCategory, string> = {
  Added: "text-emerald-400",
  Improved: "text-blue-400",
  Fixed: "text-amber-400",
};

function groupByCategory(items: ChangelogItem[]): { category: ChangelogCategory; items: ChangelogItem[] }[] {
  return CATEGORY_ORDER.map((category) => ({ category, items: items.filter((item) => item.category === category) })).filter(
    (group) => group.items.length > 0,
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => setMounted(true), []);

  useFocusTrap(dialogRef, mounted, onClose);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg rounded border border-zinc-200 bg-white p-6 shadow-xl outline-none dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={headingId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Changelog
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-lg text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="flex max-h-[70vh] flex-col divide-y divide-zinc-200 overflow-y-auto pr-1 dark:divide-zinc-800">
          {changelogEntries.map((entry) => (
            <div key={entry.date} className="py-4 first:pt-0 last:pb-0">
              <h3 className="mb-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                {entry.title ?? formatDate(entry.date)}
                {entry.title && <span className="ml-2 text-xs font-normal text-zinc-500">{formatDate(entry.date)}</span>}
              </h3>
              <div className="flex flex-col gap-3">
                {groupByCategory(entry.items).map((group) => (
                  <div key={group.category}>
                    <p className={`mb-1 text-xs font-medium uppercase tracking-wide ${CATEGORY_CLASSES[group.category]}`}>
                      {group.category}
                    </p>
                    <ul className="flex list-disc flex-col gap-1 pl-4 marker:text-zinc-400 dark:marker:text-zinc-600">
                      {group.items.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
