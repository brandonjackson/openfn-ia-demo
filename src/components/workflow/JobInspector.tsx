import { useState } from "react";
import { ADAPTORS_WITHOUT_CREDENTIALS, adaptorShortName, resolveAdaptor } from "../../mock-data/adaptors";
import type { EditorJob } from "../../mock-data/workflow";
import AdaptorDisplay from "./AdaptorDisplay";
import AdaptorSelectionModal from "./AdaptorSelectionModal";
import AlertDialog from "./AlertDialog";
import ConfigureAdaptorModal from "./ConfigureAdaptorModal";
import EditorButton from "./EditorButton";
import TextField from "./FormField";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";
import NewRunButton from "./NewRunButton";

interface Props {
  job: EditorJob;
  projectId: string;
  adaptorsInUse: string[];
  onChange: (patch: Partial<EditorJob>) => void;
  onClose: () => void;
  onOpenEditor: () => void;
  onDelete: () => void;
  onRunFromHere: () => void;
  /** A job with downstream steps can't be deleted. */
  canDelete?: boolean;
}

/**
 * The job inspector (inspector/JobInspector.tsx + JobForm.tsx): Job Name,
 * the adaptor row, and a footer with the code-editor and delete buttons on
 * the left and "Run From Here" on the right.
 */
export default function JobInspector({
  job,
  projectId,
  adaptorsInUse,
  onChange,
  onClose,
  onOpenEditor,
  onDelete,
  onRunFromHere,
  canDelete = true,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFromConfigure, setPickerFromConfigure] = useState(false);

  const needsConnect = !job.credentialName && !ADAPTORS_WITHOUT_CREDENTIALS.includes(adaptorShortName(job.adaptor));

  const footer = (
    <InspectorFooter
      leftButtons={
        <>
          <span className="inline-block" title="Open code editor ( ⌘ E )">
            <EditorButton aria-label="Code" variant="secondary" onClick={onOpenEditor}>
              <span className="hero-arrows-pointing-out block" />
            </EditorButton>
          </span>
          <span className="inline-block" title={canDelete ? "Delete this job" : "You can't delete a step that other steps depend on"}>
            <EditorButton aria-label="Delete" variant="secondary" onClick={() => setConfirmDelete(true)} disabled={!canDelete}>
              <span className="hero-trash block" />
            </EditorButton>
          </span>
        </>
      }
      rightButtons={
        <NewRunButton onClick={onRunFromHere} text="Run From Here" variant={needsConnect ? "secondary" : "primary"} tooltip="⌘ Enter" />
      }
    />
  );

  return (
    <>
      <InspectorLayout title={job.name} onClose={onClose} footer={footer} data-testid="job-inspector">
        <div className="px-6 py-6 md:grid md:grid-cols-6 md:gap-4">
          <div className="col-span-6">
            <TextField
              name="name"
              label="Job Name"
              value={job.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="col-span-6">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              Adaptor
              <span
                className="hero-information-circle h-4 w-4 text-gray-400"
                aria-label="Information"
                role="img"
                title="Choose an adaptor to perform operations (via helper functions) in a specific application. Pick 'http' for generic REST APIs or the 'common' adaptor if this job only performs data manipulation."
              />
            </label>
            <AdaptorDisplay
              adaptor={job.adaptor}
              credentialName={job.credentialName}
              onEdit={() => setConfigureOpen(true)}
              onChangeAdaptor={() => setPickerOpen(true)}
            />
          </div>
        </div>
      </InspectorLayout>

      <ConfigureAdaptorModal
        isOpen={configureOpen}
        onClose={() => setConfigureOpen(false)}
        projectId={projectId}
        adaptor={job.adaptor}
        credentialName={job.credentialName}
        onChangeAdaptor={() => {
          setConfigureOpen(false);
          setPickerFromConfigure(true);
          setPickerOpen(true);
        }}
        onVersionChange={(v) => onChange({ adaptor: `${resolveAdaptor(job.adaptor).package}@${v}` })}
        onCredentialChange={(name) => onChange({ credentialName: name })}
      />
      <AdaptorSelectionModal
        isOpen={pickerOpen}
        adaptorsInUse={adaptorsInUse}
        onClose={() => {
          setPickerOpen(false);
          if (pickerFromConfigure) setConfigureOpen(true);
          setPickerFromConfigure(false);
        }}
        onSelect={(pkg) => onChange({ adaptor: `${pkg}@latest`, credentialName: null })}
      />
      <AlertDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete Job?"
        description={`This will permanently remove "${job.name}" from the workflow. This action cannot be undone.`}
        confirmLabel="Delete Job"
        variant="danger"
      />
    </>
  );
}
