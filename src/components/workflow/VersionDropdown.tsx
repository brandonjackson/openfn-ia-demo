import type { WorkflowSnapshot } from "../../types/workflow-graph";
import { cn } from "../../utils/cn";
import { formatLocalDateTime } from "../../utils/format";
import Menu, { MenuHeader, MenuItem } from "../Menu";

interface Props {
  snapshots: WorkflowSnapshot[];
  /** The pinned snapshot, or null when viewing the latest. */
  pinnedVersion: number | null;
  onVersionSelect: (version: number | "latest") => void;
}

/**
 * The version pill beside the workflow name (SnapshotVersionDropdown.tsx):
 * "latest" in indigo, or "v12" in yellow when an older snapshot is pinned.
 * The menu lists every saved snapshot, newest first.
 */
export default function VersionDropdown({ snapshots, pinnedVersion, onVersionSelect }: Props) {
  const isLatest = pinnedVersion === null;
  const newest = snapshots[0];

  return (
    <div className="inline-block" data-annotation="workflow-editor-versions-and-promote">
      <Menu
        align="start"
        className="w-56 max-h-80 overflow-y-auto"
        panelProps={{ "data-annotation": "workflow-editor-versions-and-promote" }}
        trigger={
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              isLatest ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            )}
          >
            {isLatest ? "latest" : `v${pinnedVersion}`}
            <span className="hero-chevron-down h-3 w-3" />
          </button>
        }
      >
        {snapshots.length === 0 ? (
          <MenuHeader>
            <span className="text-gray-500">No versions available</span>
          </MenuHeader>
        ) : (
          <>
            {newest && (
              <MenuItem selected={isLatest} description={formatLocalDateTime(newest.insertedAt)} onClick={() => onVersionSelect("latest")}>
                latest
              </MenuItem>
            )}
            {snapshots.map((s) => (
              <MenuItem
                key={s.lockVersion}
                selected={!isLatest && s.lockVersion === pinnedVersion}
                description={formatLocalDateTime(s.insertedAt)}
                onClick={() => onVersionSelect(s.lockVersion)}
              >
                v{s.lockVersion}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </div>
  );
}
