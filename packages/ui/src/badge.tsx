import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger";

function getBadgeClasses(variant: BadgeVariant): string {
  const base =
    "ui:inline-flex ui:items-center ui:rounded-full ui:px-2.5 ui:py-1 ui:text-sm ui:font-semibold";

  switch (variant) {
    case "success":
      return `${base} ui:bg-blue-1000 ui:text-white`;
    case "warning":
      return `${base} ui:bg-purple-1000 ui:text-white`;
    case "danger":
      return `${base} ui:bg-red-1000 ui:text-white`;
    case "default":
      return `${base} ui:bg-neutral-900 ui:text-white`;
  }
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const base = getBadgeClasses(variant);
  return (
    <span className={className ? `${base} ${className}` : base}>
      {children}
    </span>
  );
}
