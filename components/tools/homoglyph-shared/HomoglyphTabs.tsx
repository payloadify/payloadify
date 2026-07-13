import { TabSwitcher } from "@/components/ui/TabSwitcher";

const TABS = [
  { id: "identify", label: "Identify", href: "/homoglyph-identifier" },
  { id: "generate", label: "Generate", href: "/homoglyph-generator" },
] as const;

export function HomoglyphTabs({ active }: { active: "identify" | "generate" }) {
  return <TabSwitcher tabs={TABS} active={active} />;
}
