import { TabSwitcher } from "@/components/ui/TabSwitcher";

const TABS = [
  { id: "identify", label: "Identify", href: "/hash-identifier" },
  { id: "generate", label: "Generate", href: "/hash-generator" },
] as const;

export function HashToolTabs({ active }: { active: "identify" | "generate" }) {
  return <TabSwitcher tabs={TABS} active={active} />;
}
