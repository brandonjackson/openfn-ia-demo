import { useId, useState } from "react";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import type { OrganizationInvite, OrganizationMember } from "../../model/organization";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Modal from "../primitives/Modal";
import Stack from "../primitives/Stack";

const roleHints: Record<OrganizationMember["role"], string> = {
  Owner: "Can do everything, including making other owners.",
  Admin: "Manages members, visibility, context and X-Road settings.",
  Member: "Sees the organisation's settings and works in their projects.",
};

interface Props {
  /** The roles you may give: an admin can't make an owner. */
  roles: OrganizationMember["role"][];
  /** Sends the invitation; the modal closes once it resolves, and shows what the server refused. */
  onInvite: (invite: OrganizationInvite) => Promise<void>;
  onClose: () => void;
}

/**
 * Invites someone to the organisation by email, with a role. Someone already
 * on OpenFn joins at once; anyone else is invited. Mount it when it should show.
 */
export default function InviteOrgMemberModal({ roles, onInvite, onClose }: Props) {
  const id = useId();
  const [invite, setInvite] = useState<OrganizationInvite>({ email: "", role: roles.includes("Member") ? "Member" : roles[0]! });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const complete = /\S+@\S+\.\S+/.test(invite.email);

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await onInvite({ ...invite, email: invite.email.trim() });
      onClose();
    } catch (refused) {
      setError(refused);
    } finally {
      setSending(false);
    }
  };

  const emailError = fieldErrorOf(error, "email");
  return (
    <Modal
      open
      title="Invite member"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={send} disabled={!complete || sending}>
            Send invitation
          </Button>
        </>
      }
    >
      <Stack gap="md">
        {error !== null && !emailError && (
          <Callout variant="danger" title="The invitation wasn't sent">
            {errorMessageOf(error)}
          </Callout>
        )}
        <FormField label="Email" htmlFor={`${id}-email`} error={emailError} required>
          <TextInput id={`${id}-email`} type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
        </FormField>
        <FormField label="Role" htmlFor={`${id}-role`} hint={roleHints[invite.role]}>
          <Select
            id={`${id}-role`}
            options={roles.map((r) => ({ value: r, label: r }))}
            value={invite.role}
            onChange={(e) => setInvite({ ...invite, role: e.target.value as OrganizationMember["role"] })}
          />
        </FormField>
      </Stack>
    </Modal>
  );
}
