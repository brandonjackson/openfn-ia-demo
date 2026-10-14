import { cn } from "../../utils/cn";

/**
 * "Run abc1234" chip with a dismiss X (collaborative-editor/components/common/
 * RunBadge.tsx + Badge.tsx), shown when a run is selected.
 */
export default function RunBadge({
  runId,
  onClose,
  variant = "default",
  className,
}: {
  runId: string;
  onClose?: () => void;
  variant?: "default" | "warning";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-x-1 rounded-md px-2 py-1 text-xs font-medium",
        variant === "default" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-800",
        className
      )}
    >
      <span className="flex items-center">Run {runId.slice(0, 7)}</span>
      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={cn(
            "group relative -mr-1 flex items-center justify-center h-3.5 w-3.5 rounded-sm",
            variant === "default" ? "hover:bg-blue-600/20" : "hover:bg-yellow-700/20"
          )}
          aria-label="Remove"
          title="Remove"
        >
          <span className="sr-only">Remove</span>
          <span className="hero-x-mark h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
