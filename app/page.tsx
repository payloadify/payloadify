import Link from "next/link";
import { getTool } from "@/lib/tools-registry";

const sections: { title: string; slugs: string[] }[] = [
  {
    title: "Hashing",
    slugs: ["hash-identifier"],
  },
  {
    title: "Encoding & Decoding",
    slugs: ["jwt-decoder", "payload-encode", "homoglyph-identifier"],
  },
  {
    title: "Calculators",
    slugs: ["cvss-calculator"],
  },
  {
    title: "Payload Generators",
    slugs: [
      "xss-generator",
      "sqli-generator",
      "reverse-shell-generator",
      "msfvenom-generator",
    ],
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Free pentest tools, one job each
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          No accounts, no tracking, no server round-trips where it can be
          avoided. Pick a tool below — everything runs in your browser.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.slugs.map((slug) => {
                const tool = getTool(slug);
                if (!tool) return null;

                return tool.status === "live" ? (
                  <Link
                    key={tool.slug}
                    href={`/${tool.slug}`}
                    className="rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                  >
                    <h3 className="font-medium">{tool.name}</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {tool.shortDescription}
                    </p>
                  </Link>
                ) : (
                  <div
                    key={tool.slug}
                    className="rounded-lg border border-dashed border-zinc-200 p-5 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                  >
                    <h3 className="font-medium">{tool.name}</h3>
                    <p className="mt-1 text-sm">{tool.shortDescription}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide">
                      Coming soon
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
