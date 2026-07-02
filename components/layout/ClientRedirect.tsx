"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ClientRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      This page has moved. Redirecting to <a href={to} className="underline">{to}</a>…
    </p>
  );
}
