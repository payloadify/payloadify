import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { HashToolTabs } from "@/components/tools/hash-shared/HashToolTabs";
import { HashIdentifierTool } from "@/components/tools/hash-identifier/HashIdentifierTool";

export const metadata: Metadata = {
  title: "Hash Identifier — Detect Hash Type & Hashcat Mode",
  description:
    "Paste a hash to identify its likely type (MD5, SHA-1, SHA-256, NTLM, bcrypt, and more) from its structure and length, with ranked candidates and the matching Hashcat mode number — free, runs entirely in your browser.",
};

export default function HashIdentifierPage() {
  return (
    <ToolPageLayout
      title="Hash Identifier"
      description="Paste a hash string to detect its likely type by structure and length, ranked by confidence, with the matching Hashcat mode number for cracking."
    >
      <HashToolTabs active="identify" />
      <HashIdentifierTool />
    </ToolPageLayout>
  );
}
