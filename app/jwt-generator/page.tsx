import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { JwtToolTabs } from "@/components/tools/jwt-shared/JwtToolTabs";
import { JwtGeneratorTool } from "@/components/tools/jwt-generator/JwtGeneratorTool";

export const metadata: Metadata = {
  title: "JWT Generator — Build & Sign a JWT Online",
  description:
    "Build and sign a JWT online with HMAC, RSA, ECDSA, or RSA-PSS — generate secrets or keypairs, quick-add claims, scenario presets, and weakness flags. Free, runs entirely in your browser.",
};

export default function JwtGeneratorPage() {
  return (
    <ToolPageLayout
      title="JWT Generator"
      description="Build a JWT from an editable header and payload, sign it with HMAC, RSA, ECDSA, or RSA-PSS, and copy the result — entirely client-side."
    >
      <JwtToolTabs active="generate" />
      <JwtGeneratorTool />
    </ToolPageLayout>
  );
}
