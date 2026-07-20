import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { PayloadDirectionTabs } from "@/components/tools/payload-encoder/PayloadDirectionTabs";
import { PayloadEncoderTool } from "@/components/tools/payload-encoder/PayloadEncoderTool";

export const metadata: Metadata = {
  title: "Payload Encoder Online: Base64, Hex, URL, HTML Entity",
  description:
    "Encode text as Base64, Hex, URL, or HTML-entity: chain multiple steps together to build obfuscated payloads, free, entirely in your browser, no data leaves your device.",
};

export default function PayloadEncodePage() {
  return (
    <ToolPageLayout
      title="Payload Encoder"
      description="Encode text as Base64, Hex, URL, or HTML-entity. Chain multiple steps together (each step's output feeds the next) to build obfuscated payloads."
    >
      <PayloadDirectionTabs active="encode" />
      <PayloadEncoderTool direction="encode" />
    </ToolPageLayout>
  );
}
