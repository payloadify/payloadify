import Link from "next/link";
import { getTool } from "@/lib/tools-registry";

const sections: { title: string; slugs: string[] }[] = [
  {
    title: "Calculators",
    slugs: ["cvss-calculator"],
  },
  {
    title: "Hashing",
    slugs: ["hash-identifier"],
  },
  {
    title: "Text & Token Tools",
    slugs: ["jwt-decoder", "payload-encoder", "homoglyph-identifier"],
  },
  {
    title: "Payload Generators",
    slugs: ["xss-generator", "sqli-generator", "reverse-shell-generator", "subdomain-permutation-generator"],
  },
  {
    title: "Command Builders",
    slugs: ["hashcat-generator", "msfvenom-generator", "nmap-generator"],
  },
  {
    title: "Recon & Infrastructure Checks",
    slugs: ["security-headers-analyzer", "spf-dkim-dmarc-checker"],
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
          avoided. Pick a tool below. Everything runs in your browser.
        </p>
      </div>

      <div id="tools" className="space-y-12">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-5 border-b border-zinc-200 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
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
                    className="rounded-lg border border-zinc-200 p-5 shadow-sm transition-all hover:-translate-y-px hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:shadow-none dark:hover:border-zinc-600"
                  >
                    <h3 className="text-base font-semibold tracking-tight">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {tool.tagline}
                    </p>
                    {tool.supports && (
                      <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                        {tool.supports}
                      </p>
                    )}
                    {tool.meta.length > 0 && (
                      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-600">
                        {tool.meta.join(" • ")}
                      </p>
                    )}
                  </Link>
                ) : (
                  <div
                    key={tool.slug}
                    className="rounded-lg border border-dashed border-zinc-200 p-5 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                  >
                    <h3 className="text-base font-semibold tracking-tight">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 text-sm">{tool.tagline}</p>
                    {tool.supports && (
                      <p className="mt-0.5 text-sm">{tool.supports}</p>
                    )}
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
