import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { HashToolTabs } from "@/components/tools/hash-shared/HashToolTabs";
import { HashGeneratorTool } from "@/components/tools/hash-generator/HashGeneratorTool";

export const metadata: Metadata = {
  title: "Hash Generator: MD5, SHA-256, SHA-1, NTLM Online",
  description:
    "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, and NTLM hashes from any text, instantly and entirely in your browser. Free online hash generator, no data leaves your device.",
};

export default function HashGeneratorPage() {
  return (
    <ToolPageLayout
      title="Hash Generator"
      description="Type or paste text and generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, and NTLM hashes all at once."
    >
      <HashToolTabs active="generate" />
      <HashGeneratorTool />
    </ToolPageLayout>
  );
}
