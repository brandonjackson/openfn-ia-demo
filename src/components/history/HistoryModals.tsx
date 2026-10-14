import { useEffect, useState, type ReactNode } from "react";
import Button from "../Button";
import Modal from "../Modal";

/**
 * The centred confirmation dialog History's bulk actions use
 * (run_live/components.ex `bulk_rerun_modal` / `bulk_cancel_modal`): a
 * blurred backdrop, a white sm:max-w-lg panel with a centred title and
 * copy, and a two-column button grid.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Button grid content (use `sm:col-start-*` classes as Lightning does). */
  actions: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="relative z-50" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" />
      <div className="fixed inset-0 z-10 overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
              <div className="mt-2">{children}</div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">{actions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Run Selected Work Orders" (Retry on the bulk bar). */
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
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Run Selected Work Orders"
      actions={
        <>
          <Button onClick={onClose} className="inline-flex w-full justify-center sm:col-start-2">
            Rerun {selectedCount} selected work order{selectedCount > 1 ? "s" : ""} from start
          </Button>
          <Button theme="secondary" onClick={onClose} className="w-full sm:col-start-1">
            Cancel
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        You've selected {selectedCount} work orders to rerun from the start. This will create a new run for each
        selected work order.
      </p>
    </ConfirmDialog>
  );
}

/** "Cancel Pending Runs" (Cancel on the bulk bar). */
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
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Cancel Pending Runs"
      actions={
        <>
          <Button onClick={onClose} className="inline-flex w-full justify-center sm:col-start-2">
            Cancel up to {selectedCount} selected
          </Button>
          <Button theme="secondary" onClick={onClose} className="w-full sm:col-start-1">
            Go back
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        This will cancel pending runs for the selected work orders. Any runs that have already been claimed by a
        worker will be skipped.
      </p>
    </ConfirmDialog>
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
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Run from a specific step"
      actions={
        <>
          <Button onClick={onClose} className="inline-flex w-full justify-center sm:col-start-2">
            Rerun {selectedCount} selected work order{selectedCount === 1 ? "" : "s"} from selected job
          </Button>
          <Button theme="secondary" onClick={onClose} className="w-full sm:col-start-1">
            Cancel
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        Find all runs that include this step and rerun from there. (Note that if you'd like to reprocess all of the
        selected work orders from the start, use the "Rerun" button, not this "Rerun from" button.)
      </p>
      <fieldset className="mt-4">
        <legend className="sr-only">Workflow Job</legend>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center">
              <input
                id={`job_${job.id}`}
                name="job"
                type="radio"
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={selected === job.id}
                onChange={() => setSelected(job.id)}
              />
              <label htmlFor={`job_${job.id}`} className="ml-3 block text-sm leading-6 font-medium text-gray-900">
                {job.name}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </ConfirmDialog>
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
    <Modal
      open={open}
      onClose={onClose}
      width="w-1/3"
      title={<span className="font-bold">Confirm history export</span>}
      footer={
        <>
          <Button onClick={onClose}>Export history</Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="space-y-6 bg-white text-sm text-slate-900">
        Exporting history will download all {count} work orders and associated runs, steps, and I/O data clips that
        match your query.
        <br />
        The export will happen in the background and you'll receive an email when it is complete.
      </div>
    </Modal>
  );
}
