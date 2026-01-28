type AvatarSize = "sm" | "md" | "lg";

function getSizeClasses(size: AvatarSize): string {
  switch (size) {
    case "sm":
      return "ui:w-8 ui:h-8 ui:text-xs";
    case "lg":
      return "ui:w-12 ui:h-12 ui:text-base";
    case "md":
    default:
      return "ui:w-10 ui:h-10 ui:text-sm";
  }
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
}: {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
}) {
  const sizeClasses = getSizeClasses(size);
  const baseClasses =
    "ui:inline-flex ui:items-center ui:justify-center ui:rounded-full ui:font-semibold ui:bg-neutral-700 ui:text-white ui:overflow-hidden ui:flex-shrink-0";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`ui:object-cover ui:rounded-full ${sizeClasses} ${baseClasses}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`${baseClasses} ${sizeClasses}`}
      role="img"
      aria-label={alt || fallback || "Avatar"}
    >
      {fallback ?? "?"}
    </span>
  );
}
