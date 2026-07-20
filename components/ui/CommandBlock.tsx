import { ReactNode } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

/** Shared "generated command" output markup — was duplicated verbatim across MSFVenom, Reverse
 *  Shell, and Hashcat Command Builder before this existed. `actions` is required (not defaulted
 *  to a single CopyButton) since every tool wants different label text/multiple buttons; `children`
 *  holds whatever goes below the code block (captions, risk callouts, usage notes) in whichever
 *  order that tool needs — deliberately not opinionated about that part, since it differs per tool. */
export function CommandBlock({
  label,
  command,
  actions,
  children,
}: {
  label: string;
  command: string;
  actions: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className="flex gap-2">{actions}</div>
      </div>
      <code className="block rounded border border-zinc-200 bg-white p-3 text-sm break-all whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
        {command}
      </code>
      {children}
    </div>
  );
}

/** The smaller labeled code-row used inside "Usage Guide"/"Companion commands" collapsibles —
 *  a companion command with its own copy button. `label` is optional since not every row has one
 *  (e.g. the reverse shell tool's TTY-upgrade row goes straight to the code+button row). */
export function InlineCommandRow({
  label,
  command,
  copyText,
}: {
  label?: string;
  command: string;
  copyText?: string;
}) {
  return (
    <div>
      {label && <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>}
      <div className="flex items-center justify-between gap-2">
        <code className="block flex-1 rounded border border-zinc-200 bg-white p-2 text-xs break-all dark:border-zinc-800 dark:bg-zinc-900">
          {command}
        </code>
        <CopyButton text={copyText ?? command} />
      </div>
    </div>
  );
}
