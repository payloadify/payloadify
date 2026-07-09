import { CopyButton } from "@/components/ui/CopyButton";
import { Callout } from "@/components/ui/Callout";

export function OutputPanel({ token, error }: { token: string; error: string | null }) {
  if (error) {
    return <Callout variant="danger">{error}</Callout>;
  }
  if (!token) return null;

  const [header, payload, signature] = token.split(".");

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium">Signed token</label>
        <CopyButton text={token} label="Copy token" />
      </div>
      <textarea
        readOnly
        value={token}
        rows={4}
        className="w-full rounded border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs break-all dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { label: "Header", value: header },
          { label: "Payload", value: payload },
          { label: "Signature", value: signature ?? "" },
        ].map((seg) => (
          <div key={seg.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{seg.label}</span>
              <CopyButton text={seg.value} />
            </div>
            <pre className="max-h-20 overflow-auto rounded bg-zinc-50 p-2 text-xs break-all whitespace-pre-wrap dark:bg-zinc-900">
              {seg.value || "(empty)"}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
