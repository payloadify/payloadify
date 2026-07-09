import { Callout } from "@/components/ui/Callout";
import { WeaknessFlag } from "@/lib/jwt/weaknessFlags";

export function WeaknessFlags({ flags }: { flags: WeaknessFlag[] }) {
  if (flags.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {flags.map((flag) => (
        <Callout key={flag.id} variant={flag.variant}>
          {flag.text}
        </Callout>
      ))}
    </div>
  );
}
