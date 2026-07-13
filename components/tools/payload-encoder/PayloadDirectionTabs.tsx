import { TabSwitcher } from "@/components/ui/TabSwitcher";

const TABS = [
  { id: "encode", label: "Encode", href: "/payload-encode" },
  { id: "decode", label: "Decode", href: "/payload-decode" },
] as const;

export function PayloadDirectionTabs({ active }: { active: "encode" | "decode" }) {
  return <TabSwitcher tabs={TABS} active={active} />;
}
