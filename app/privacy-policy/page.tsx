import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy & Terms of Service",
  description:
    "Payloadify's privacy policy and terms of service — how the site handles data (it mostly doesn't) and the terms for using its free pentest tools.",
};

export default function PrivacyPolicyPage() {
  return (
    <ToolPageLayout
      title="Privacy Policy & Terms of Service"
      description="Last updated July 2, 2026."
    >
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Privacy Policy
          </h2>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            What we collect
          </h3>
          <p>
            Payloadify's tools run entirely in your browser. Anything you type
            or paste into a tool — tokens, hashes, payloads, target info — is
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
            payloadify.dev.
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
            If this policy changes, we'll update this page and the "last
            updated" date above.
          </p>
        </section>

        <section>
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
            If you find a security issue on payloadify.dev itself (as
            opposed to the tools' output), we'd genuinely appreciate a
            heads-up before it's disclosed publicly. Please note that we
            don't run a bug bounty program and don't offer payment or public
            credit for reports — we're a free, self-funded project. Report
            issues in good faith and give us a reasonable chance to fix them
            before going public.
          </p>

          <h3 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            Contact
          </h3>
          <p>
            Questions about these terms, the privacy policy, or a security
            report can be sent to{" "}
            <a
              href="mailto:contact@payloadify.dev"
              className="text-zinc-900 underline dark:text-zinc-100"
            >
              contact@payloadify.dev
            </a>
            .
          </p>
        </section>
      </div>
    </ToolPageLayout>
  );
}
