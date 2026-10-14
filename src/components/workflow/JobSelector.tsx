import type { EditorJob } from "../../mock-data/workflow";
import ButtonMenu from "../ButtonMenu";
import { MenuItem } from "../Menu";

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
    <ButtonMenu label={currentJob?.name || "Select a job"} align="start" className="w-56 max-h-60 overflow-y-auto">
      {jobs.map((job) => (
        <MenuItem key={job.id} selected={job.id === currentJob?.id} onClick={() => onChange(job)}>
          {job.name}
        </MenuItem>
      ))}
    </ButtonMenu>
  );
}
