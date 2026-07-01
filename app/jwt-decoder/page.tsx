import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { JwtDecoderTool } from "@/components/tools/jwt-decoder/JwtDecoderTool";

export const metadata: Metadata = {
  title: "JWT Decoder & Tamper Tool",
  description:
    "Decode JWT header and payload online, detect alg:none and weak HMAC secrets, edit claims, and re-sign or strip the token — free, runs entirely in your browser.",
};

export default function JwtDecoderPage() {
  return (
    <ToolPageLayout
      title="JWT Decoder / Tamper"
      description="Paste a JWT to decode its header and payload, check for alg:none and weak signing secrets, then edit claims and re-sign or export an unsigned token."
    >
      <JwtDecoderTool />
    </ToolPageLayout>
  );
}
