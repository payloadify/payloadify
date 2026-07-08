import { ReactNode } from "react";

const styles: Record<"warning" | "danger" | "info" | "success", string> = {
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  danger:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  info: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
  success:
    "border-green-300 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200",
};

export function Callout({
  variant = "info",
  children,
}: {
  variant?: "warning" | "danger" | "info" | "success";
  children: ReactNode;
}) {
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      aria-live={variant === "danger" ? "assertive" : "polite"}
      className={`rounded border px-3 py-2 text-sm ${styles[variant]}`}
    >
      {children}
    </div>
  );
}
