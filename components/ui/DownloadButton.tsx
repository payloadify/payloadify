"use client";

import { useEffect, useRef, useState } from "react";
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        saveAsFile({ filename, content, mimeType });
        setSaved(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setSaved(false), 1500);
      }}
      className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
    >
      {saved ? "Saved" : label}
    </button>
  );
}
