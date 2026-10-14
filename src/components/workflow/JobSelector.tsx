import { useCallback, useRef, useState } from "react";
import type { EditorJob } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import { useDismiss } from "./useDismiss";

/**
 * The job name dropdown at the start of the IDE header (JobSelector.tsx):
 * switches the IDE to another job without going back to the canvas.
 */
export default function JobSelector({
  currentJob,
  jobs,
  onChange,
}: {
  currentJob: EditorJob | null;
  jobs: EditorJob[];
  onChange: (job: EditorJob) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center font-medium text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <span>{currentJob?.name || "Select a job"}</span>
        <span className="hero-chevron-up-down w-4 h-4 ml-1 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 z-[100] mt-1 max-h-60 w-56 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg outline-1 outline-black/5">
          {jobs.map((job) => {
            const selected = job.id === currentJob?.id;
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => {
                  onChange(job);
                  close();
                }}
                className="group relative w-full text-left cursor-default py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-indigo-600 hover:text-white"
              >
                <span className={cn("block truncate", selected ? "font-semibold" : "font-normal")}>{job.name}</span>
                {selected && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-hover:text-white">
                    <span className="hero-check w-5 h-5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
