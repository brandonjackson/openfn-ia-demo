import { useState } from "react";
import { addableRoles, isValidEmail, projectRoleLabels, type ProjectRole } from "../../model/project-settings";
import { type CollaboratorDraft, type CollaboratorInvite } from "../../model/projects";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import { Select, TextInput } from "../primitives/FormControls";

const roleOptions = addableRoles.map((r) => ({ value: r, label: projectRoleLabels[r] }));

interface Props {
  /** The people to invite, from the emails that had no OpenFn account. The modal shows while there are any. */
  people: CollaboratorDraft[];
  onClose: () => void;
  /** Sends the invitations. Resolves once they're sent; the modal closes itself. */
  onInvite: (invites: CollaboratorInvite[]) => Promise<void>;
}

/**
 * Invites people without an OpenFn account to join OpenFn and this project,
 * after Add collaborators couldn't find them. Each needs a first and last name.
 */
export default function InviteCollaboratorsModal({ people, ...rest }: Props) {
  if (people.length === 0) return null;
  return <InviteForm people={people} {...rest} />;
}

function InviteForm({ people, onClose, onInvite }: Props) {
  const [rows, setRows] = useState<CollaboratorInvite[]>(() => people.map((p) => ({ firstName: "", lastName: "", ...p })));
  const [sending, setSending] = useState(false);
  const valid = rows.every((r) => r.firstName.trim() && r.lastName.trim() && isValidEmail(r.email));
  const update = (i: number, change: Partial<CollaboratorInvite>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...change } : r)));
  const submit = async () => {
    setSending(true);
    await onInvite(rows.map((r) => ({ ...r, firstName: r.firstName.trim(), lastName: r.lastName.trim(), email: r.email.trim() })));
    setSending(false);
    onClose();
  };

  return (
    <Modal
      open
      title="Invite new user(s) to join OpenFn"
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || sending} onClick={submit}>
            {rows.length > 1 ? "Invite new users" : "Invite new user"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <Text tone="muted" size="xs" block>
          The following users don't have OpenFn accounts, you can invite them to join and grant access to this project
        </Text>
        {rows.map((row, i) => (
          <Inline key={i} gap="sm" wrap>
            <Inline grow>
              <TextInput
                aria-label={`First name ${i + 1}`}
                placeholder="First name"
                autoFocus={i === 0}
                value={row.firstName}
                onChange={(e) => update(i, { firstName: e.target.value })}
              />
            </Inline>
            <Inline grow>
              <TextInput
                aria-label={`Last name ${i + 1}`}
                placeholder="Last name"
                value={row.lastName}
                onChange={(e) => update(i, { lastName: e.target.value })}
              />
            </Inline>
            <Inline grow>
              <TextInput
                type="email"
                aria-label={`Email ${i + 1}`}
                placeholder="email@example.com"
                value={row.email}
                onChange={(e) => update(i, { email: e.target.value })}
              />
            </Inline>
            <Select
              aria-label={`Role ${i + 1}`}
              options={roleOptions}
              value={row.role}
              onChange={(e) => update(i, { role: e.target.value as ProjectRole })}
            />
          </Inline>
        ))}
      </Stack>
    </Modal>
  );
}
