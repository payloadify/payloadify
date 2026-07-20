import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { PayloadDirectionTabs } from "@/components/tools/payload-encoder/PayloadDirectionTabs";
import { PayloadEncoderTool } from "@/components/tools/payload-encoder/PayloadEncoderTool";

export const metadata: Metadata = {
  title: "Payload Decoder Online: Base64, Hex, URL, HTML Entity",
  description:
    "Decode Base64, Hex, URL, or HTML-entity payloads: chain multiple steps together to unwrap obfuscated data, free, entirely in your browser, no data leaves your device.",
};

export default function PayloadDecodePage() {
  return (
    <ToolPageLayout
      title="Payload Decoder"
      description="Decode Base64, Hex, URL, or HTML-entity payloads. Chain multiple steps together (each step's output feeds the next) to unwrap obfuscated data."
    >
      <PayloadDirectionTabs active="decode" />
      <PayloadEncoderTool direction="decode" />
    </ToolPageLayout>
  );
}
