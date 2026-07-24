import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy & Terms of Service",
  description:
    "Payloadify's privacy policy and terms of service: how the site handles data (it mostly doesn't) and the terms for using its free browser-native security workflows.",
};

export default function PrivacyPolicyPage() {
  return (
    <ToolPageLayout
      title="Privacy Policy & Terms of Service"
      description="Last updated July 7, 2026."
    >
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300">
        <section id="privacy">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Privacy Policy
          </h2>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            What we collect
          </h3>
          <p>
            Payloadify's tools run entirely in your browser. Anything you type
            or paste into a tool (tokens, hashes, payloads, target info) is
            processed locally on your device and is never sent to our
            servers. We don't have a database and we don't log tool input.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Local storage
          </h3>
          <p>
            Some tools use your browser's local storage to remember recent
            generations or to enforce a per-tool rate limit (e.g. capping how
            many payloads you can generate per minute). This data stays on
            your device, is never transmitted anywhere, and you can clear it
            at any time by clearing your browser's site data for
            payloadify.com.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Hosting and standard web logs
          </h3>
          <p>
            The site is hosted on Cloudflare Pages. Like most hosting
            providers, Cloudflare may collect standard connection-level
            information (e.g. IP address, request timing) for security and
            performance purposes. We don't control or access this data
            beyond aggregate hosting metrics, and we don't use it to identify
            individual visitors.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Cookies and tracking
          </h3>
          <p>
            We don't use tracking cookies, analytics scripts, or third-party
            advertising. There are no accounts, no logins, and nothing to
            sign up for.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Changes to this policy
          </h3>
          <p>
            Payloadify is under active development: we regularly ship new
            tools, feature updates, patches, and bug fixes. If this policy
            changes as a result, we'll update this page and the "last
            updated" date above.
          </p>
        </section>

        <section id="tos">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Terms of Service
          </h2>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Intended use
          </h3>
          <p>
            Payloadify provides free tools for security testing, bug bounty
            research, and security education. These tools are built for use
            against systems you own or are authorized to test. You are
            solely responsible for ensuring you have proper authorization
            before using any generated payload, encoded string, or other
            output against a target.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            No warranty
          </h3>
          <p>
            Tools are provided "as is," with no warranty of any kind. We make
            a good-faith effort at correctness, but we don't guarantee that
            any output (hash, payload, decoded value, etc.) is accurate,
            complete, or fit for a particular purpose. Verify anything
            security-critical independently. Most tools are free to use; if
            any tool ever introduces a paid tier in the future, that will be
            clearly labeled on the tool itself before you use it.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Tool accuracy and ongoing refinement
          </h3>
          <p>
            Payloadify's tools are developed and shipped rapidly, often with
            the help of AI-assisted development workflows. As a result, some
            generated commands, payloads, or outputs may not behave exactly
            as expected in every environment or edge case. Every new tool and
            feature goes through code review and security testing before it's
            deployed, and we cross-check outputs against expected results as
            part of that process, but we can't cover every possible
            configuration or environment.
          </p>
          <p>
            This is an intentional, ongoing process rather than a
            one-time effort: as each tool sees more real-world use, we
            revisit it, retire rough edges, and tighten its accuracy in
            subsequent updates. Tools you use today should be expected to
            keep improving over time, not stay static. If you run into
            output that looks wrong, we'd appreciate a report (see Contact
            below); that feedback directly shapes what gets refined next.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Limitation of liability
          </h3>
          <p>
            We are not liable for any damages, losses, or legal consequences
            arising from your use or misuse of this site or its output,
            including unauthorized use of generated payloads against systems
            you don't have permission to test.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Acceptable use
          </h3>
          <p>
            Don't use automated tools to bypass the per-tool rate limits, and
            don't use the site in a way that disrupts it for other users.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Responsible disclosure
          </h3>
          <p>
            If you find a security issue on payloadify.com itself (as
            opposed to the tools' output), we'd genuinely appreciate a
            heads-up before it's disclosed publicly. Please note that we
            don't run a bug bounty program and don't offer payment or public
            credit for reports: we're a free, self-funded project. Report
            issues in good faith and give us a reasonable chance to fix them
            before going public.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Site updates
          </h3>
          <p>
            Payloadify is an evolving project. We may update the site
            regularly to add new tools, improve existing ones, and ship
            patches and bug fixes, without prior notice. Continued use of the
            site after an update means you accept the terms as they stand at
            that time.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Contact
          </h3>
          <p>
            Found a bug in a tool, or have a feature request? Open an issue on{" "}
            <a
              href="https://github.com/payloadify/payloadify-web/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              GitHub
            </a>
            . For a security report or anything you'd rather not post
            publicly, email{" "}
            <a
              href="mailto:contact@payloadify.com"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              contact@payloadify.com
            </a>
            .
          </p>
        </section>
      </div>
    </ToolPageLayout>
  );
}
