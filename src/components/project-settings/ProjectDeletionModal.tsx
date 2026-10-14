import { useState } from "react";
import ConfirmModal from "../ConfirmModal";
import { TextInput } from "../Inputs";
import type { Project } from "../../mock-data/projects";

interface Props {
  project: Project;
  /** Days until the project is purged; 0 means "today". */
  gracePeriodDays: number;
  onCancel: () => void;
  onDelete: () => void;
}

/**
 * Lightning's ProjectDeletionModal (live/components/project_deletion_modal.ex),
 * opened by /projects/:id/settings/delete. The Delete button enables once
 * the typed name matches.
 */
export default function ProjectDeletionModal({ project, gracePeriodDays, onCancel, onDelete }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = confirmation === project.name;
  const when = gracePeriodDays > 0 ? `${gracePeriodDays} day(s) from today` : "today";

  return (
    <ConfirmModal
      open
      onClose={onCancel}
      onConfirm={onDelete}
      title="Delete project"
      confirmLabel="Delete project"
      tone="danger"
      confirmDisabled={!valid}
    >
      <form id="scheduled_deletion_form" className="space-y-3" onSubmit={(e) => (e.preventDefault(), valid && onDelete())}>
        <p>
          Enter the project name to confirm deletion: <b>{project.name}</b>
        </p>
        <p>
          Deleting this project will disable access for all users, and disable all jobs in the project. The whole
          project will be deleted along with all workflows and work order history, {when}.
        </p>
        <TextInput
          id="project_name_confirmation"
          label="Project name"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          onBlur={() => setTouched(true)}
          errors={touched && confirmation !== "" && !valid ? ["doesn't match the project name"] : []}
        />
      </form>
    </ConfirmModal>
  );
}
