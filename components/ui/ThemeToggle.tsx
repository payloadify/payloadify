"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "payloadify:theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  // Assume dark on first render (matches the blocking init script in layout.tsx)
  // to avoid a mismatch flash for the common case; corrected after mount below.
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private browsing, disabled) - theme still applies for this page load.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-300 text-xs font-semibold text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 ${className}`}
    >
      {isDark ? "D" : "L"}
    </button>
  );
}
