import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-500">
        <p>
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-300">
            Payloadify
          </Link>{" "}
          — free pentest utility tools. Everything runs client-side in your
          browser; nothing you paste here is sent to a server.
        </p>
        <Link href="/privacy-policy" className="shrink-0 hover:text-zinc-900 dark:hover:text-zinc-300">
          Privacy Policy · ToS · GitHub
        </Link>
      </div>
    </footer>
  );
}
