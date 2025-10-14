import { cn } from "@/lib/utils";

type LogoWordmarkSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoWordmarkSize, string> = {
  sm: "text-[14px] sm:text-[16px]",
  md: "text-[18px] sm:text-[20px]",
  lg: "text-[22px] sm:text-[24px]",
};

interface LogoWordmarkProps {
  size?: LogoWordmarkSize;
  className?: string;
}

/**
 * LogoWordmark - TrakSense brand wordmark with consistent typography
 * 
 * Features:
 * - Baseline aligned text parts
 * - Consistent font-size and tracking
 * - Responsive sizing (sm/md/lg)
 * - Works in light/dark themes
 */
export function LogoWordmark({ size = "md", className }: LogoWordmarkProps) {
  return (
    <span
      aria-label="TrakSense"
      className={cn(
        "inline-flex items-baseline whitespace-nowrap leading-none font-semibold tracking-[-0.015em]",
        sizeMap[size],
        className
      )}
    >
      <span className="align-baseline">Trak</span>
      <span className="align-baseline">Sense</span>
    </span>
  );
}
