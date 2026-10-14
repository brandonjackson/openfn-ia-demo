import { useCallback, useRef, useState } from "react";
import type { WorkflowSnapshot } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import { useDismiss } from "./useDismiss";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const isLatest = pinnedVersion === null;
  const newest = snapshots[0];

  const pick = (v: number | "latest") => {
    onVersionSelect(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block" data-annotation="workflow-editor-versions-and-promote">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors",
          isLatest
            ? "bg-primary-100 text-primary-800 hover:bg-primary-200"
            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span>{isLatest ? "latest" : `v${pinnedVersion}`}</span>
        <span className={cn("hero-chevron-down h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg outline-1 outline-black/5 z-50 max-h-80 overflow-y-auto">
          <div className="py-1" role="menu">
            {snapshots.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No versions available</div>
            ) : (
              <>
                {newest && (
                  <button
                    type="button"
                    onClick={() => pick("latest")}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between",
                      isLatest ? "bg-primary-50 text-primary-900" : "text-gray-700"
                    )}
                    role="menuitem"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">latest</span>
                      <span className="text-xs text-gray-500">{new Date(newest.insertedAt).toLocaleString()}</span>
                    </div>
                    {isLatest && <span className="hero-check h-4 w-4 text-primary-600" />}
                  </button>
                )}
                {snapshots.map((s) => {
                  const selected = !isLatest && s.lockVersion === pinnedVersion;
                  return (
                    <button
                      key={s.lockVersion}
                      type="button"
                      onClick={() => pick(s.lockVersion)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between",
                        selected ? "bg-primary-50 text-primary-900" : "text-gray-700"
                      )}
                      role="menuitem"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">v{s.lockVersion}</span>
                        <span className="text-xs text-gray-500">{new Date(s.insertedAt).toLocaleString()}</span>
                      </div>
                      {selected && <span className="hero-check h-4 w-4 text-primary-600" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
