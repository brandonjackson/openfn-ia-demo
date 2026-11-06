import { useId, useState } from "react";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import type { AdminUser, AdminUserDraft, InstanceRole } from "../../model/users";
import { fullName, instanceRoleLabels } from "../../model/admin";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Checkbox from "../primitives/Checkbox";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Modal from "../primitives/Modal";
import Stack from "../primitives/Stack";
import ToggleSwitch from "../primitives/ToggleSwitch";

interface Props {
  /** The account to edit. Without one, the form creates a new user. */
  user?: AdminUser;
  /** Saves the form; the modal closes once it resolves. */
  onSave: (draft: AdminUserDraft) => Promise<void>;
  onClose: () => void;
}

const roles = Object.keys(instanceRoleLabels) as InstanceRole[];

/**
 * A superuser creates or edits an account: name, email, a first password
 * for a new user, their reach on the instance (user or superuser), whether
 * they're a support user, and, when editing, whether they're disabled.
 * Mount it when it should show; it starts from the account given.
 */
export default function UserFormModal({ user, onSave, onClose }: Props) {
  const id = useId();
  const [draft, setDraft] = useState<AdminUserDraft>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "user",
    supportUser: user?.supportUser ?? false,
    disabled: user?.disabled ?? false,
    password: user ? undefined : "",
  });
  const [saving, setSaving] = useState(false);
  // A save the server refused: shown above the form, which stays open.
  const [error, setError] = useState<unknown>(null);
  const set = (patch: Partial<AdminUserDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const complete =
    draft.firstName.trim() && draft.lastName.trim() && /\S+@\S+\.\S+/.test(draft.email) && (user || draft.password);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      onClose();
    } catch (refused) {
      setError(refused);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={user ? `Edit ${fullName(user)}` : "New user"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!complete || saving} title={complete ? undefined : "All fields are required"}>
            {user ? "Save" : "Create user"}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        {error !== null && (
          <Callout variant="danger" title="The account wasn't saved">
            {saveErrorOf(error)}
          </Callout>
        )}
        <FormField label="First name" htmlFor={`${id}-first`}>
          <TextInput id={`${id}-first`} value={draft.firstName} onChange={(e) => set({ firstName: e.target.value })} />
        </FormField>
        <FormField label="Last name" htmlFor={`${id}-last`}>
          <TextInput id={`${id}-last`} value={draft.lastName} onChange={(e) => set({ lastName: e.target.value })} />
        </FormField>
        <FormField label="Email" htmlFor={`${id}-email`}>
          <TextInput
            id={`${id}-email`}
            type="email"
            value={draft.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        </FormField>
        {!user && (
          <FormField label="Password" htmlFor={`${id}-password`} hint="They can change it once they've logged in.">
            <TextInput
              id={`${id}-password`}
              type="password"
              autoComplete="new-password"
              value={draft.password ?? ""}
              onChange={(e) => set({ password: e.target.value })}
            />
          </FormField>
        )}
        <FormField
          label="Role"
          htmlFor={`${id}-role`}
          hint="A superuser can reach everything on this instance, across every project, including Admin settings."
        >
          <Select
            id={`${id}-role`}
            options={roles.map((r) => instanceRoleLabels[r])}
            value={instanceRoleLabels[draft.role]}
            onChange={(e) => set({ role: roles.find((r) => instanceRoleLabels[r] === e.target.value) ?? "user" })}
          />
        </FormField>
        <ToggleSwitch label="Support user" checked={draft.supportUser} onChange={(on) => set({ supportUser: on })} />
        {draft.supportUser && (
          <Callout variant="warning" title="Heads up">
            This user will be able to open every project that has support access turned on.
          </Callout>
        )}
        {user && (
          <Checkbox
            label="Disabled"
            hint="A disabled user can't log in."
            checked={draft.disabled}
            disabled={user.isSelf}
            onChange={(on) => set({ disabled: on })}
          />
        )}
      </Stack>
    </Modal>
  );
}

/** A refused save in the form's words: which field, and what's wrong with it. */
function saveErrorOf(error: unknown): string {
  const fields: [string, string][] = [["email", "Email"], ["password", "Password"], ["first_name", "First name"], ["last_name", "Last name"], ["role", "Role"]];
  for (const [field, label] of fields) {
    const problem = fieldErrorOf(error, field);
    if (problem) return `${label} ${problem}.`;
  }
  return errorMessageOf(error);
}
