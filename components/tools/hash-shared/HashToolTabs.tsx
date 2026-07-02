import Link from "next/link";

const TABS = [
  { id: "identify", label: "Identify", href: "/hash-identifier" },
  { id: "generate", label: "Generate", href: "/hash-generator" },
] as const;

export function HashToolTabs({ active }: { active: "identify" | "generate" }) {
  return (
    <div className="mb-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium " +
            (tab.id === active
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200")
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
