export const toggleButtonClasses = (active: boolean) =>
  `rounded border px-3 py-1.5 text-sm ${
    active
      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
  }`;

export const selectClasses =
  "rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const inputClasses =
  "w-full rounded border border-zinc-300 bg-white p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const iconButtonClasses =
  "rounded border border-zinc-300 px-2 py-1.5 text-sm text-zinc-600 hover:border-zinc-400 disabled:opacity-30 disabled:hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:disabled:hover:border-zinc-700";

/** Same shape as iconButtonClasses, for an action that saves/confirms something positive. */
export const successButtonClasses =
  "rounded border border-green-300 px-2 py-1.5 text-sm text-green-700 hover:border-green-400 hover:bg-green-50 disabled:opacity-30 disabled:hover:border-green-300 disabled:hover:bg-transparent dark:border-green-800 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-950/40";

/** Same shape as iconButtonClasses, for a destructive action (e.g. deleting all saved data). */
export const dangerButtonClasses =
  "rounded border border-red-300 px-2 py-1.5 text-sm text-red-600 hover:border-red-400 hover:bg-red-50 disabled:opacity-30 disabled:hover:border-red-300 disabled:hover:bg-transparent dark:border-red-800 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-950/40";

export const checkboxLabelClasses = "flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400";

/** Inline badge for a CLI flag mentioned inside a prose sentence (e.g. explanatory notes under a
 *  template picker), so it visually separates from the surrounding text instead of blending in. */
export const flagBadgeClasses =
  "rounded bg-indigo-50 px-1 py-0.5 font-mono text-[0.85em] text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
