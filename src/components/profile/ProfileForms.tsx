import { useState, type FormEvent, type ReactNode } from "react";
import Button from "../Button";
import Card from "../Card";
import InfoTooltip from "../InfoTooltip";
import { PasswordInput, Select, TextInput } from "../Inputs";
import type { User } from "../../types/users";
import { contactPreferenceOptions, contactPreferenceTooltip } from "../../constants";
import { isValidEmail } from "../../utils/validate";

/**
 * The three forms of ProfileLive.FormComponent (profile_live/form_component.html.heex),
 * each its own card. Static: submitting only updates local state.
 */

function FormCard({ id, title, onSubmit, children, button }: { id: string; title: string; onSubmit: () => void; children: ReactNode; button: ReactNode }) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  return (
    <form id={id} onSubmit={submit} data-annotation="profile-account">
      <Card padding="lg" title={title} className="space-y-6">
        {children}
        {button}
      </Card>
    </form>
  );
}

export function BasicInfoForm({ user, onSave }: { user: User; onSave?: (u: Pick<User, "firstName" | "lastName" | "contactPreference">) => void }) {
  const [saved, setSaved] = useState({ firstName: user.firstName, lastName: user.lastName, contactPreference: user.contactPreference });
  const [values, setValues] = useState(saved);
  const changed = JSON.stringify(values) !== JSON.stringify(saved);
  const valid = values.firstName.trim() !== "" && values.lastName.trim() !== "";
  return (
    <FormCard
      id="basic-info-form"
      title="Change basic information"
      onSubmit={() => {
        setSaved(values);
        onSave?.(values);
      }}
      button={
        <Button type="submit" disabled={!valid || !changed}>
          Save
        </Button>
      }
    >
      <TextInput
        label="First name"
        required
        autoComplete="given-name"
        value={values.firstName}
        errors={values.firstName.trim() ? [] : ["can't be blank"]}
        onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
      />
      <TextInput
        label="Last name"
        required
        autoComplete="family-name"
        value={values.lastName}
        errors={values.lastName.trim() ? [] : ["can't be blank"]}
        onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
      />
      <Select
        label={
          <>
            Contact preference<span className="text-red-500"> *</span>
            <InfoTooltip title={contactPreferenceTooltip} />
          </>
        }
        options={contactPreferenceOptions}
        value={values.contactPreference}
        onChange={(e) => setValues((v) => ({ ...v, contactPreference: e.target.value as User["contactPreference"] }))}
      />
    </FormCard>
  );
}

export function ChangeEmailForm({ onSubmit }: { onSubmit?: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const valid = isValidEmail(email) && password !== "";
  return (
    <FormCard
      id="email-form"
      title="Change email"
      onSubmit={() => onSubmit?.(email)}
      button={
        <Button type="submit" disabled={!valid}>
          Update email
        </Button>
      }
    >
      <TextInput label="New email address" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <PasswordInput
        label="Enter password to confirm"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </FormCard>
  );
}

export function ChangePasswordForm({ onSubmit }: { onSubmit?: () => void }) {
  const [values, setValues] = useState({ password: "", confirmation: "", current: "" });
  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const tooShort = values.password !== "" && values.password.length < 12;
  const mismatch = values.confirmation !== "" && values.confirmation !== values.password;
  const valid = values.password.length >= 12 && !mismatch && values.confirmation !== "" && values.current !== "";
  return (
    <FormCard
      id="password-form"
      title="Change password"
      onSubmit={() => onSubmit?.()}
      button={
        <Button type="submit" disabled={!valid}>
          Update password
        </Button>
      }
    >
      <PasswordInput
        label="New password"
        required
        autoComplete="new-password"
        value={values.password}
        onChange={set("password")}
        errors={tooShort ? ["should be at least 12 character(s)"] : []}
      />
      <PasswordInput
        label="Confirm new password"
        required
        autoComplete="new-password"
        value={values.confirmation}
        onChange={set("confirmation")}
        errors={mismatch ? ["does not match password"] : []}
      />
      <PasswordInput label="Current password" required autoComplete="current-password" value={values.current} onChange={set("current")} />
    </FormCard>
  );
}
