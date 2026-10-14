import { useState } from "react";
import Button from "../Button";
import { Label, TextInput } from "../Inputs";
import Modal from "../Modal";
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
    <Modal
      open
      onClose={onCancel}
      width="max-w-md"
      title="Delete project"
      footer={
        <>
          <Button
            id={`project-${project.id}_confirm_button`}
            theme="danger"
            disabled={!valid}
            onClick={onDelete}
          >
            Delete project
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <form id="scheduled_deletion_form" onSubmit={(e) => (e.preventDefault(), valid && onDelete())}>
        <p>
          Enter the project name to confirm deletion: <b>{project.name}</b>
        </p>
        <p className="my-2">
          Deleting this project will disable access for all users, and disable all jobs in the project. The whole
          project will be deleted along with all workflows and work order history, {when}.
        </p>
        <Label htmlFor="project_name_confirmation">Project name</Label>
        <TextInput
          id="project_name_confirmation"
          value={confirmation}
          className="w-full"
          onChange={(e) => setConfirmation(e.target.value)}
          onBlur={() => setTouched(true)}
          errors={touched && confirmation !== "" && !valid ? ["doesn't match the project name"] : []}
        />
      </form>
    </Modal>
  );
}
