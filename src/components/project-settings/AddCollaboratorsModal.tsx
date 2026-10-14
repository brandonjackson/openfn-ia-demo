import { useState } from "react";
import Button from "../Button";
import { FieldError, Select, TextInput } from "../Inputs";
import IconButton from "../IconButton";
import Modal from "../Modal";
import { roleOptions } from "./roleOptions";
import type { ProjectRole } from "../../mock-data/projects";

export interface CollaboratorDraft {
  email: string;
  role: ProjectRole | "";
}

interface Props {
  /** Emails already on the project ("This account is already part of this project"). */
  existingEmails: string[];
  onCancel: () => void;
  onSave: (collaborators: CollaboratorDraft[]) => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+$/;

/**
 * NewCollaboratorComponent (project_live/new_collaborator_component.html.heex):
 * one or more email + role rows. The page decides which emails belong to
 * existing users and which need an invite.
 */
export default function AddCollaboratorsModal({ existingEmails, onCancel, onSave }: Props) {
  const [rows, setRows] = useState<CollaboratorDraft[]>([{ email: "", role: "" }]);
  const update = (i: number, patch: Partial<CollaboratorDraft>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const errorFor = (r: CollaboratorDraft) => {
    if (r.email && !emailPattern.test(r.email)) return "has invalid format";
    if (existingEmails.includes(r.email.toLowerCase())) return "This account is already part of this project";
    return null;
  };
  const valid = rows.every((r) => r.email && r.role && !errorFor(r));

  return (
    <Modal
      open
      onClose={onCancel}
      title="Add new collaborator(s)"
      description="Enter the email address and role of new collaborator(s) to invite them to this project"
      footer={
        <>
          <Button id="save_collaborators_button" type="submit" form="add_collaborators_modal_form" disabled={!valid}>
            Save Collaborator{rows.length > 1 ? "s" : ""}
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <form
        id="add_collaborators_modal_form"
        className="space-y-5"
        onSubmit={(e) => (e.preventDefault(), valid && onSave(rows))}
      >
        {rows.map((r, i) => {
          const error = errorFor(r);
          return (
            <div key={i}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <TextInput
                    aria-label="Email"
                    placeholder="email@example.com"
                    required
                    value={r.email}
                    onChange={(e) => update(i, { email: e.target.value })}
                  />
                </div>
                <Select
                  aria-label="Role"
                  prompt="Select Role"
                  required
                  options={roleOptions}
                  value={r.role}
                  onChange={(e) => update(i, { role: e.target.value as ProjectRole })}
                />
                {rows.length > 1 && (
                  <IconButton icon="hero-minus-circle" label="Remove row" onClick={() => setRows(rows.filter((_, j) => j !== i))} />
                )}
              </div>
              {error && <FieldError>{error}</FieldError>}
            </div>
          );
        })}
        <Button theme="secondary" onClick={() => setRows([...rows, { email: "", role: "" }])}>
          <span className="hero-plus-circle h-5 w-5" />
          Add Additional Collaborator
        </Button>
      </form>
    </Modal>
  );
}
