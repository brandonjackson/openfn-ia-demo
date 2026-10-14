import { formatRelative, formatRelativeDetailed, formatTimeOnly, formatUtc } from "../utils/format";
import { cn } from "../utils/cn";

/**
 * Lightning's `Common.datetime`: a local, relative timestamp ("today at
 * 6:36 PM") with the UTC value as its tooltip. "--" when there's no value.
 */
export default function DateTime({
  value,
  format = "relative",
  className,
}: {
  value: string | null | undefined;
  format?: "relative" | "relative_detailed" | "time_only";
  className?: string;
}) {
  if (!value) return <span className={cn("text-gray-400", className)}>--</span>;
  const text =
    format === "time_only"
      ? formatTimeOnly(value)
      : format === "relative_detailed"
        ? formatRelativeDetailed(value)
        : formatRelative(value);
  return (
    <span title={formatUtc(value)} className={cn("cursor-pointer", className)}>
      {text}
    </span>
  );
}
