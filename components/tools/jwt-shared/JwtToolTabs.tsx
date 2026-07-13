import { TabSwitcher } from "@/components/ui/TabSwitcher";

const TABS = [
  { id: "decode", label: "Decode", href: "/jwt-decoder" },
  { id: "generate", label: "Generate", href: "/jwt-generator" },
] as const;

export function JwtToolTabs({ active }: { active: "decode" | "generate" }) {
  return <TabSwitcher tabs={TABS} active={active} />;
}
