import { Callout } from "@/components/ui/Callout";

/** Required per CLAUDE.md on every generator-type tool page. `subject` lets the wording match
 *  what's actually being targeted (e.g. "domains" for the subdomain tool vs "systems" elsewhere). */
export function AuthorizedUseNotice({ subject = "systems" }: { subject?: "systems" | "domains" }) {
  return <Callout variant="warning">Use only on {subject} you own or are explicitly authorized to test.</Callout>;
}
