import { useState } from "react";
import { PASSWORD_MIN, passwordErrors } from "../../model/account";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /**
   * Sets a new password, confirmed with the current one. Rejects with a
   * message to show, e.g. when the current password is wrong.
   */
  onChangePassword: (password: string, currentPassword: string) => Promise<void>;
}

/**
 * Changing your password, with Lightning's rules: at least 12 characters
 * and no more than 72, typed twice to match, and your current password to
 * confirm it's you.
 */
export default function ChangePasswordForm({ onChangePassword }: Props) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [current, setCurrent] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const errors = { ...passwordErrors(password, confirmation), current: current ? undefined : "can't be blank" };
  const shown: Partial<typeof errors> = attempted ? errors : {};

  const submit = async () => {
    setAttempted(true);
    setServerError(undefined);
    setDone(false);
    if (errors.password || errors.confirmation || errors.current) return;
    setBusy(true);
    try {
      await onChangePassword(password, current);
      setPassword("");
      setConfirmation("");
      setCurrent("");
      setAttempted(false);
      setDone(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Change password" description="Confirm your current password to set a new one.">
      <Stack gap="md">
        <FormField
          label="New password"
          htmlFor="new-password"
          required
          hint={`At least ${PASSWORD_MIN} characters.`}
          error={shown.password}
        >
          <TextInput id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirm-password" required error={shown.confirmation}>
          <TextInput
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </FormField>
        <FormField label="Current password" htmlFor="current-password" required error={serverError ?? shown.current}>
          <TextInput
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setServerError(undefined);
            }}
          />
        </FormField>
        <Inline justify="end" gap="md">
          {done && <Text tone="success">Password changed successfully.</Text>}
          <Button disabled={busy} onClick={submit}>
            {busy ? "Saving…" : "Update password"}
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}
