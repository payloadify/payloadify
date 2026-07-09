import { ALGORITHM_GROUPS, ALGORITHMS, JoseAlg } from "@/lib/jwt/algorithms";
import { selectClasses } from "@/components/ui/formClasses";

export function AlgorithmPicker({ alg, onChange }: { alg: JoseAlg; onChange: (alg: JoseAlg) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Algorithm</label>
      <select className={selectClasses} value={alg} onChange={(e) => onChange(e.target.value as JoseAlg)}>
        {ALGORITHM_GROUPS.map((group) => (
          <optgroup key={group.family} label={group.label}>
            {group.algs.map((a) => (
              <option key={a} value={a}>
                {ALGORITHMS[a].label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
