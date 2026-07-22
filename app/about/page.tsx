import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Payloadify exists: turning multi-step, syntax-heavy pentest tasks into a click-driven flow, running entirely client-side.",
};

export default function AboutPage() {
  return (
    <ToolPageLayout title="About" description="Why this exists.">
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300">
        <section>
          <p>
            Pentesting and bug bounty work are full of tasks that are simple
            in theory and a pain in practice: remembering the right hashcat
            mode and flags, assembling a reverse shell one-liner without
            breaking the quoting, decoding a JWT to check if it&apos;s signed with{" "}
            <code>alg: none</code>. None of it is hard. All of it is easy to
            get slightly wrong, and today it gets pieced together from cheat
            sheets, slow or cluttered sites, or memory.
          </p>
          <p>
            Scoring CVSS is the same problem: every finding needs a score,
            and searching for a score you already used in a previous report
            is a hassle. That&apos;s why the CVSS calculator lets you save a
            finding&apos;s scoring and click to reload it next time. That
            friction, everywhere and not just CVSS, is the reason Payloadify
            exists.
          </p>
          <p>
            The goal is to collapse that multi-step, syntax-heavy work
            into one clean, fast, click-driven flow: pick options, copy the
            result. It&apos;s for people who wants a quick, reliable, and private tool to get the job done.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No accounts, nothing sent anywhere
          </h2>
          <p>
            No accounts, no tracking, no login. Everything runs client-side in
            your browser. Nothing you type or paste into these tools is ever
            sent to a server.
          </p>
          <p>
            Don&apos;t take that on faith. Check the code:{" "}
            <a
              href="https://github.com/payloadify/payloadify-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              github.com/payloadify/payloadify-web
            </a>
            .
          </p>
        </section>

         <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Prioritizing speed
          </h2>
          <p>
            Payloadify is designed to be fast. In every development decision, user experience is always kept in mind e.g. if feature X would slow down the site or make it harder to use, it is not implemented. Catchy animations and flashy graphics are avoided in favor of a clean, fast, and efficient interface.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Correctness
          </h2>
          <p>
            Every generated payload, command, and score is spot-checked
            against known-good references before it ships. If something looks
            wrong, report it as a{" "}
            <a
              href="https://github.com/payloadify/payloadify-web/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              GitHub issue
            </a>
            . That&apos;s how it gets fixed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Feedback
          </h2>
          <p>
            Found a bug, or want a tool built?{" "}
            <a
              href="https://github.com/payloadify/payloadify-web/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              Open an issue on GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </ToolPageLayout>
  );
}
