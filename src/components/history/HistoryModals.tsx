import { useState } from "react";
import ConfirmModal from "../ConfirmModal";
import { Radio } from "../Inputs";

const plural = (n: number) => (n === 1 ? "" : "s");

/** "Run Selected Work Orders" (Retry on the bulk bar; run_live/components.ex `bulk_rerun_modal`). */
export function BulkRerunModal({
  open,
  onClose,
  selectedCount,
}: {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
}) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onClose}
      title="Run Selected Work Orders"
      confirmLabel={`Rerun ${selectedCount} selected work order${plural(selectedCount)} from start`}
    >
      <p>
        You've selected {selectedCount} work orders to rerun from the start. This will create a new run for each
        selected work order.
      </p>
    </ConfirmModal>
  );
}

/** "Cancel Pending Runs" (Cancel on the bulk bar; run_live/components.ex `bulk_cancel_modal`). */
export function BulkCancelModal({
  open,
  onClose,
  selectedCount,
}: {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
}) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onClose}
      title="Cancel Pending Runs"
      confirmLabel={`Cancel up to ${selectedCount} selected`}
      cancelLabel="Go back"
    >
      <p>
        This will cancel pending runs for the selected work orders. Any runs that have already been claimed by a
        worker will be skipped.
      </p>
    </ConfirmModal>
  );
}

/** "Run from a specific step" (Retry from on the bulk bar; rerun_job_component.ex). */
export function RerunFromJobModal({
  open,
  onClose,
  jobs,
  selectedCount,
}: {
  open: boolean;
  onClose: () => void;
  jobs: { id: string; name: string }[];
  selectedCount: number;
}) {
  const [selected, setSelected] = useState(jobs[0]?.id);
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onClose}
      title="Run from a specific step"
      confirmLabel={`Rerun ${selectedCount} selected work order${plural(selectedCount)} from selected job`}
    >
      <p>
        Find all runs that include this step and rerun from there. (Note that if you'd like to reprocess all of the
        selected work orders from the start, use the "Rerun" button, not this "Rerun from" button.)
      </p>
      <fieldset className="space-y-2 pt-1">
        <legend className="sr-only">Workflow Job</legend>
        {jobs.map((job) => (
          <Radio
            key={job.id}
            name="job"
            label={job.name}
            checked={selected === job.id}
            onChange={() => setSelected(job.id)}
          />
        ))}
      </fieldset>
    </ConfirmModal>
  );
}

/** "Confirm history export" (run_live/export_confirmation_modal.ex). */
export function ExportConfirmationModal({
  open,
  onClose,
  count,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
}) {
  return (
    <ConfirmModal open={open} onClose={onClose} onConfirm={onClose} title="Confirm history export" confirmLabel="Export history">
      <p>
        Exporting history will download all {count} work orders and associated runs, steps, and I/O data clips that
        match your query.
      </p>
      <p>The export will happen in the background and you'll receive an email when it is complete.</p>
    </ConfirmModal>
  );
}
