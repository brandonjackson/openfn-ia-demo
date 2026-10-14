import { useState } from "react";
import Button from "../Button";
import { Select, TextInput } from "../Inputs";
import IconButton from "../IconButton";
import Modal from "../Modal";
import type { ProjectRole } from "../../mock-data/projects";
import { collaboratorRoles } from "../../mock-data/project-settings";

export interface InviteDraft {
  firstName: string;
  lastName: string;
  email: string;
  role: ProjectRole | "";
}

interface Props {
  /** Prefilled from the emails that had no OpenFn account. */
  initial: { email: string; role: ProjectRole | "" }[];
  onCancel: () => void;
  onInvite: (invites: InviteDraft[]) => void;
}

const roleOptions = collaboratorRoles.map((r) => [r.charAt(0).toUpperCase() + r.slice(1), r] as [string, string]);

/** InviteCollaboratorComponent (project_live/invite_collaborator_component.html.heex). */
export default function InviteCollaboratorsModal({ initial, onCancel, onInvite }: Props) {
  const [rows, setRows] = useState<InviteDraft[]>(
    (initial.length ? initial : [{ email: "", role: "" as const }]).map((r) => ({ firstName: "", lastName: "", ...r }))
  );
  const update = (i: number, patch: Partial<InviteDraft>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const valid = rows.every((r) => r.firstName && r.lastName && r.email && r.role);

  return (
    <Modal
      open
      onClose={onCancel}
      size="xl"
      title="Invite new user(s) to join OpenFn"
      description="The following users don't have OpenFn accounts, you can invite them to join and grant access to this project"
      footer={
        <>
          <Button type="submit" form="invite_collaborators_modal_form" disabled={!valid}>
            Invite new user{rows.length > 1 ? "s" : ""}
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <form id="invite_collaborators_modal_form" onSubmit={(e) => (e.preventDefault(), valid && onInvite(rows))}>
        <div className="space-y-5">
          {rows.map((r, i) => (
            <div key={i} className="relative">
              <div className="flex flex-wrap space-x-4">
                <div className="flex-1">
                  <TextInput
                    aria-label="First Name"
                    placeholder="First Name"
                    required
                    value={r.firstName}
                    onChange={(e) => update(i, { firstName: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    aria-label="Last Name"
                    placeholder="Last Name"
                    required
                    value={r.lastName}
                    onChange={(e) => update(i, { lastName: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    type="email"
                    aria-label="Email"
                    required
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
                  <IconButton icon="hero-minus-circle" label="Remove row" onClick={() => setRows(rows.filter((_, j) => j !== i))} />
                )}
              </div>
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}
