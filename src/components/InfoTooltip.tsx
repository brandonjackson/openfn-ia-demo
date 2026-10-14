import { cn } from "../utils/cn";

interface Props {
  /** Tooltip text (shown on hover via the title attribute). */
  title: string;
  icon?: string;
  iconClass?: string;
  className?: string;
}

/**
 * Lightning's `Common.tooltip` (live/components/common.ex): a small faded
 * primary info icon next to a label. Lightning uses a Tippy hook; the demo
 * uses the native title tooltip.
 */
export default function InfoTooltip({
  title,
  icon = "hero-information-circle-solid",
  iconClass = "w-4 h-4 text-primary-600 opacity-50",
  className,
}: Props) {
  return (
    <span className={cn("relative ml-1 cursor-pointer", className)} title={title} aria-label={title}>
      <span className={cn(icon, iconClass)} />
    </span>
  );
}
