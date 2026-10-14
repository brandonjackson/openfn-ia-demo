import { useState } from "react";
import Button from "../Button";
import { FieldError, Select, TextInput } from "../Inputs";
import Modal from "../Modal";
import type { ProjectRole } from "../../mock-data/projects";
import { collaboratorRoles } from "../../mock-data/project-settings";

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

const roleOptions = collaboratorRoles.map((r) => [r.charAt(0).toUpperCase() + r.slice(1), r] as [string, string]);
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
      width="min-w-1/3 max-w-xl"
      title="Add new collaborator(s)"
      subtitle={
        <span className="text-xs">
          Enter the email address and role of new collaborator(s) to invite them to this project
        </span>
      }
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
      <form id="add_collaborators_modal_form" onSubmit={(e) => (e.preventDefault(), valid && onSave(rows))}>
        <div className="space-y-5">
          {rows.map((r, i) => {
            const error = errorFor(r);
            return (
              <div key={i} className="relative">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <TextInput
                      aria-label="Email"
                      placeholder="email@example.com"
                      required
                      className="w-full"
                      value={r.email}
                      onChange={(e) => update(i, { email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Select
                      aria-label="Role"
                      prompt="Select Role"
                      required
                      options={roleOptions}
                      value={r.role}
                      onChange={(e) => update(i, { role: e.target.value as ProjectRole })}
                    />
                  </div>
                  {rows.length > 1 && (
                    <div>
                      <Button theme="secondary" aria-label="Remove row" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                        <span className="hero-minus-circle w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
                {error && (
                  <div className="absolute top-full left-0">
                    <FieldError>{error}</FieldError>
                  </div>
                )}
              </div>
            );
          })}
          <div className="mt-6 flex justify-start">
            <Button theme="secondary" className="gap-x-2" onClick={() => setRows([...rows, { email: "", role: "" }])}>
              <span className="hero-plus-circle w-5 h-5" />
              Add Additional Collaborator
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
