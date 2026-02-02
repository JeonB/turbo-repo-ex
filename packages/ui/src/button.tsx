import { type ReactNode } from "react";

type ButtonVariant = "default" | "primary" | "danger";

function getButtonClasses(variant: ButtonVariant, disabled: boolean): string {
  const base =
    "ui:inline-flex ui:items-center ui:justify-center ui:rounded-md ui:px-4 ui:py-2 ui:text-sm ui:font-semibold ui:transition-colors ui:cursor-pointer";

  if (disabled) {
    return `${base} ui:bg-neutral-800 ui:text-neutral-500 ui:cursor-not-allowed`;
  }

  switch (variant) {
    case "primary":
      return `${base} ui:bg-blue-1000 ui:text-white hover:ui:opacity-90`;
    case "danger":
      return `${base} ui:bg-red-1000 ui:text-white hover:ui:opacity-90`;
    case "default":
      return `${base} ui:bg-neutral-900 ui:text-white hover:ui:bg-neutral-800`;
  }
}

export function Button({
  children,
  variant = "default",
  disabled = false,
  type = "button",
  className,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  const base = getButtonClasses(variant, disabled);
  return (
    <button
      type={type}
      disabled={disabled}
      className={className ? `${base} ${className}` : base}
    >
      {children}
    </button>
  );
}
