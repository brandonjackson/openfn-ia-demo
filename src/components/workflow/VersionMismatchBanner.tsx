import { ArrowRight, History } from "lucide-react";

/**
 * Shown under the history panel when the selected run took place on a
 * different version from the one on the canvas. The run's results are drawn
 * on the version you're looking at, which may have changed since, so this
 * offers to load the version that actually ran.
 */
export default function VersionMismatchBanner({
  runVersion,
  viewingVersion,
  onViewAsExecuted,
}: {
  /** The version the run took place on, e.g. "v1". */
  runVersion: string;
  /** The version on the canvas, e.g. "v2". */
  viewingVersion: string;
  onViewAsExecuted?: () => void;
}) {
  return (
    <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2.5 text-xs">
      <History size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-amber-900">This run took place on {runVersion}.</p>
        <p className="mt-0.5 text-amber-800">
          You're seeing it on {viewingVersion}, which may have changed since.
        </p>
        {onViewAsExecuted && (
          <button
            type="button"
            onClick={onViewAsExecuted}
            className="mt-1.5 inline-flex items-center gap-1 font-medium text-amber-900 underline-offset-2 hover:underline"
          >
            View as executed <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
