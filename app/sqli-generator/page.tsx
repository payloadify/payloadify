import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { SqliGeneratorTool } from "@/components/tools/sqli-generator/SqliGeneratorTool";

export const metadata: Metadata = {
  title: "SQL Injection Payload Generator: Multi-Dialect SQLi Builder",
  description:
    "Build SQL injection payloads across MySQL, MSSQL, PostgreSQL, Oracle, and SQLite. Pick a level, an injection point, what to extract, and a WAF-evasion technique. Free, entirely in your browser.",
};

export default function SqliGeneratorPage() {
  return (
    <ToolPageLayout
      title="SQLi Payload Generator"
      description="Generate a SQL injection payload for a chosen dialect and injection point, with chainable info extraction, WAF-evasion obfuscation, and blacklist-character avoidance."
    >
      <SqliGeneratorTool />
    </ToolPageLayout>
  );
}
