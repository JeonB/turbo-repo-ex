import { type ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

function getAlertClasses(variant: AlertVariant): string {
  const base =
    "ui:rounded-lg ui:border ui:px-4 ui:py-3 ui:text-sm ui:font-medium";

  switch (variant) {
    case "info":
      return `${base} ui:border-blue-1000/30 ui:bg-blue-1000/10 ui:text-blue-1000`;
    case "success":
      return `${base} ui:border-blue-1000/30 ui:bg-blue-1000/10 ui:text-blue-1000`;
    case "warning":
      return `${base} ui:border-purple-1000/30 ui:bg-purple-1000/10 ui:text-purple-1000`;
    case "error":
      return `${base} ui:border-red-1000/30 ui:bg-red-1000/10 ui:text-red-1000`;
  }
}

export function Alert({
  children,
  title,
  variant = "info",
  className,
}: {
  children: ReactNode;
  title?: string;
  variant?: AlertVariant;
  className?: string;
}) {
  const base = getAlertClasses(variant);
  return (
    <div
      className={className ? `${base} ${className}` : base}
      role="alert"
    >
      {title ? <p className="ui:mb-1 ui:font-semibold">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
