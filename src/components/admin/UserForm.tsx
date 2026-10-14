import { useState } from "react";
import type { User, UserRole } from "../../mock-data/users";
import { isSupportUser, userRoleOptions } from "../../mock-data/admin";
import Alert from "../Alert";
import PasswordInput from "../auth/PasswordInput";
import Button from "../Button";
import { Checkbox, Select, TextInput } from "../Inputs";
import Toggle from "../Toggle";

interface Props {
  /** The user being edited; omit for /settings/users/new. */
  user?: User;
  onSave?: (values: UserFormValues) => void;
  /** Where Cancel goes. */
  cancelTo?: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  supportUser: boolean;
  scheduledDeletion: string;
  disabled: boolean;
}

/**
 * Lightning's admin user form (user_live/form_component.html.heex): name,
 * email, password, role, the Support User toggle (with its heads-up), and on
 * edit the scheduled deletion and disabled fields. Save stays disabled until
 * the required fields are filled.
 */
export default function UserForm({ user, onSave, cancelTo = "/settings/users" }: Props) {
  const isEdit = !!user;
  const [values, setValues] = useState<UserFormValues>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "user",
    supportUser: user ? isSupportUser(user) : false,
    scheduledDeletion: user?.scheduledDeletion ?? "",
    disabled: user?.disabled ?? false,
  });
  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const valid =
    values.firstName.trim() !== "" &&
    values.lastName.trim() !== "" &&
    values.email.trim() !== "" &&
    (isEdit || values.password.length >= 12);

  return (
    <div id={`user-${user?.id ?? "new"}`}>
      <form
        id="user-form"
        className="w-1/2 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSave?.(values);
        }}
      >
        <TextInput
          id="user_first_name"
          label="First Name"
          value={values.firstName}
          onChange={(e) => set("firstName", e.target.value)}
        />
        <TextInput
          id="user_last_name"
          label="Last Name"
          value={values.lastName}
          onChange={(e) => set("lastName", e.target.value)}
        />
        <TextInput
          id="user_email"
          label="Email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <PasswordInput
          id="user_password"
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
        />
        <Select
          id="user_role"
          label="Role"
          options={userRoleOptions}
          value={values.role}
          onChange={(e) => set("role", e.target.value as UserRole)}
        />
        <Toggle checked={values.supportUser} onChange={(v) => set("supportUser", v)} label="Support User" />
        {values.supportUser && (
          <Alert id="heads-up-description" type="warning" header="Heads Up!">
            <p>This user will be able to access ALL projects that have support access enabled</p>
          </Alert>
        )}

        {isEdit && (
          <>
            {values.role === "user" && (
              <TextInput
                id="user_scheduled_deletion"
                label="Scheduled Deletion"
                value={values.scheduledDeletion}
                onChange={(e) => set("scheduledDeletion", e.target.value)}
              />
            )}
            <Checkbox
              id="user_disabled"
              label="A disabled user will not be allowed to login."
              checked={values.disabled}
              onChange={(e) => set("disabled", e.target.checked)}
            />
          </>
        )}

        <div className="flex gap-1">
          <Button id="save-user" type="submit" disabled={!valid} tooltip="All fields are required">
            Save
          </Button>
          <Button theme="secondary" to={cancelTo}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
