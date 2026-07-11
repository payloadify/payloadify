"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChangelogModal } from "@/components/site/ChangelogModal";
import { getLatestChangelogDate } from "@/lib/changelog/entries";
import { useChangelogLastSeen, useHasUnseenChangelog } from "@/lib/storage/changelogSeen";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const latestDate = getLatestChangelogDate();
  const hasUnseen = useHasUnseenChangelog(latestDate);
  const [, markSeen] = useChangelogLastSeen();

  function openChangelog() {
    setOpen(true);
    markSeen(latestDate);
  }

  return (
    <header className="border-b border-zinc-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/android-chrome-192x192.png"
            alt="Payloadify logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "#F5F5F5" }}
          >
            Payloadify
          </span>
          <span
            className="hidden sm:inline text-sm"
            style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#8A8A8A" }}
          >
            &gt;_generate.exploit.learn
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-400">
          <button
            type="button"
            onClick={openChangelog}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="relative hover:text-zinc-100"
          >
            Changelog
            {hasUnseen && (
              <span className="absolute -top-0.5 -right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            )}
            <span className="sr-only">{hasUnseen ? " (new entries)" : ""}</span>
          </button>
          <Link href="/" className="hover:text-zinc-100">
            All tools
          </Link>
        </nav>
      </div>
      {open && <ChangelogModal onClose={() => setOpen(false)} />}
    </header>
  );
}
