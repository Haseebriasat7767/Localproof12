import { cn } from "@/lib/utils";

export function LogoMark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill={light ? "#0B1220" : "#0B1220"} />
      {/* circular workflow arc */}
      <path
        d="M8.5 19.5a8 8 0 1 1 3.2 4.2"
        stroke="#2DD4BF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* checkmark */}
      <path
        d="M11.5 16.4l3.1 3.1 6.2-7"
        stroke="#2DD4BF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* spark */}
      <path
        d="M23.4 8.2l.62 1.66 1.66.62-1.66.62-.62 1.66-.62-1.66-1.66-.62 1.66-.62.62-1.66z"
        fill="#14B8A6"
      />
    </svg>
  );
}

export function Logo({
  className,
  invert,
  showWord = true,
}: {
  className?: string;
  invert?: boolean;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWord && (
        <span
          className={cn(
            "text-[17px] font-semibold tracking-tight",
            invert ? "text-white" : "text-ink"
          )}
        >
          Chase<span className="text-teal-500">AI</span>
        </span>
      )}
    </span>
  );
}
