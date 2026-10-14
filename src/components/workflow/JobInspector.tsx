import { useState } from "react";
import { ADAPTORS_WITHOUT_CREDENTIALS, adaptorShortName, resolveAdaptor } from "../../mock-data/adaptors";
import type { EditorJob } from "../../mock-data/workflow";
import AdaptorDisplay, { ADAPTOR_HELP } from "./AdaptorDisplay";
import AdaptorSelectionModal from "./AdaptorSelectionModal";
import ConfirmModal from "../ConfirmModal";
import IconButton from "../IconButton";
import InfoTooltip from "../InfoTooltip";
import { Field, TextInput } from "../Inputs";
import ConfigureAdaptorModal from "./ConfigureAdaptorModal";
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
          <IconButton icon="hero-arrows-pointing-out" label="Code" title="Open code editor ( ⌘ E )" onClick={onOpenEditor} />
          <IconButton
            icon="hero-trash"
            label="Delete"
            title={canDelete ? "Delete this job" : "You can't delete a step that other steps depend on"}
            onClick={() => setConfirmDelete(true)}
            disabled={!canDelete}
          />
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
        <TextInput id="name" label="Job Name" value={job.name} onChange={(e) => onChange({ name: e.target.value })} />
        <Field
          label={
            <>
              Adaptor
              <InfoTooltip title={ADAPTOR_HELP} />
            </>
          }
        >
          <AdaptorDisplay
            adaptor={job.adaptor}
            credentialName={job.credentialName}
            onEdit={() => setConfigureOpen(true)}
            onChangeAdaptor={() => setPickerOpen(true)}
          />
        </Field>
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
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
        title="Delete Job?"
        confirmLabel="Delete Job"
        tone="danger"
      >
        <p>This will permanently remove "{job.name}" from the workflow. This action cannot be undone.</p>
      </ConfirmModal>
    </>
  );
}
