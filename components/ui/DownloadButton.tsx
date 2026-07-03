"use client";

import { useState } from "react";
import { saveAsFile } from "@/lib/download/saveAsFile";

export function DownloadButton({
  content,
  filename,
  mimeType,
  label = "Download",
}: {
  content: string;
  filename: string;
  mimeType?: string;
  label?: string;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        saveAsFile({ filename, content, mimeType });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }}
      className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
    >
      {saved ? "Saved" : label}
    </button>
  );
}
