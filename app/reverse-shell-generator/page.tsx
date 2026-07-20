import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ReverseShellGeneratorTool } from "@/components/tools/reverse-shell-generator/ReverseShellGeneratorTool";

export const metadata: Metadata = {
  title: "Reverse Shell Generator: One-Liners for Bash, Python, PHP, Netcat, PowerShell & More",
  description:
    "Generate reverse shell one-liners for Linux, Windows, and Mac across Bash, Netcat, Python, PHP, Perl, Ruby, Java, C, Golang, PowerShell, and more LOLBins. Pick your IP, port, and shell, then copy or save as a file. Free, entirely in your browser.",
};

export default function ReverseShellGeneratorPage() {
  return (
    <ToolPageLayout
      title="Reverse Shell Generator"
      description="Pick a target IP/port and a shell, then generate a ready-to-use reverse shell one-liner with a matching listener command. No random generation, every option is your choice."
    >
      <ReverseShellGeneratorTool />
    </ToolPageLayout>
  );
}
