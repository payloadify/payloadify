import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { HashcatCommandBuilderTool } from "@/components/tools/hashcat-command-builder/HashcatCommandBuilderTool";

export const metadata: Metadata = {
  title: "Hashcat Command Generator: Build Hashcat Commands in One Click",
  description:
    "Build a complete hashcat command: mode, attack type (dictionary, mask, hybrid, combination), wordlists, rules, and advanced flags. Then copy it straight into your terminal. Free, entirely in your browser.",
};

export default function HashcatCommandBuilderPage() {
  return (
    <ToolPageLayout
      title="Hashcat Command Generator"
      description="Pick a Hashcat mode and attack type, fill in your wordlist/mask/rules, and get a copy-ready hashcat command. No more remembering flag order or escaping hash values yourself. Comes pre-filled with the mode number when you arrive from the Hash Identifier."
    >
      <Suspense fallback={null}>
        <HashcatCommandBuilderTool />
      </Suspense>
    </ToolPageLayout>
  );
}
