import { useState } from "react";
import { ADAPTORS_WITHOUT_CREDENTIALS } from "../../constants";
import { adaptorShortName } from "../../utils/adaptors";
import type { EditorJob } from "../../types/workflow-graph";
import AdaptorDisplay, { ADAPTOR_HELP } from "./AdaptorDisplay";
import AdaptorConfigModals, { type AdaptorModal } from "./AdaptorConfigModals";
import ConfirmModal from "../ConfirmModal";
import IconButton from "../IconButton";
import InfoTooltip from "../InfoTooltip";
import { Field, TextInput } from "../Inputs";
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
  const [adaptorModal, setAdaptorModal] = useState<AdaptorModal>(null);

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
            onEdit={() => setAdaptorModal("configure")}
            onChangeAdaptor={() => setAdaptorModal("picker")}
          />
        </Field>
      </InspectorLayout>

      <AdaptorConfigModals
        open={adaptorModal}
        onOpenChange={setAdaptorModal}
        projectId={projectId}
        job={job}
        adaptorsInUse={adaptorsInUse}
        onChange={onChange}
        returnToConfigure
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
