import type { EditorJob } from "../../mock-data/workflow";
import Menu, { MenuItem } from "../Menu";

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
  return (
    <Menu
      align="start"
      className="w-56 max-h-60 overflow-y-auto"
      trigger={
        <button type="button" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          {currentJob?.name || "Select a job"}
          <span className="hero-chevron-up-down ml-1 h-4 w-4 shrink-0" />
        </button>
      }
    >
      {jobs.map((job) => (
        <MenuItem key={job.id} selected={job.id === currentJob?.id} onClick={() => onChange(job)}>
          {job.name}
        </MenuItem>
      ))}
    </Menu>
  );
}
