import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { XssGeneratorTool } from "@/components/tools/xss-generator/XssGeneratorTool";

export const metadata: Metadata = {
  title: "XSS Payload Generator — WAF Bypass & Encoding Techniques",
  description:
    "Generate XSS payloads across basic to advanced WAF-bypass and encoding techniques, for reflected/stored or DOM-based contexts — free, entirely in your browser.",
};

export default function XssGeneratorPage() {
  return (
    <ToolPageLayout
      title="XSS Payload Generator"
      description="Generate an XSS payload using common WAF-bypass and encoding techniques, from basic tag injection to advanced obfuscation. Pick a level, a context, and what the payload should do."
    >
      <XssGeneratorTool />
    </ToolPageLayout>
  );
}
