import { cn } from "../../utils/cn";

/**
 * The workflow version a run used (Common.snapshot_version_chip): indigo
 * "latest", or a yellow version number for an older snapshot.
 */
export default function SnapshotVersionChip({ version, tooltip }: { version: string; tooltip?: string }) {
  return (
    <div className="flex items-middle text-sm font-normal">
      <span
        title={tooltip}
        className={cn(
          "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
          version === "latest" ? "bg-primary-100 text-primary-800" : "bg-yellow-100 text-yellow-800"
        )}
      >
        {version}
      </span>
    </div>
  );
}
