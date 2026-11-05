import { useState } from "react";
import { Mail } from "lucide-react";
import { emailError } from "../../model/credentials";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Card from "../primitives/Card";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";

interface Props {
  /** The address you sign in with now. */
  currentEmail: string;
  /** A new address waiting for its confirmation link to be clicked. */
  pendingEmail?: string;
  /**
   * Asks to move to a new address, confirmed with your password. The change
   * happens once you click the link we email. Rejects with a message to
   * show, e.g. when the address is already taken or the password is wrong.
   */
  onChangeEmail: (email: string, currentPassword: string) => Promise<void>;
}

/**
 * Changing the email you sign in with: a new address and your password. We
 * email a link to the new address, and the change happens when it's clicked;
 * until then the form says where the link went.
 */
export default function ChangeEmailForm({ currentEmail, pendingEmail, onChangeEmail }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const errors = {
    email: emailError(email) ?? (email.trim() === currentEmail ? "did not change" : undefined),
    password: password ? undefined : "can't be blank",
  };

  const submit = async () => {
    setAttempted(true);
    setServerError(undefined);
    if (errors.email || errors.password) return;
    setBusy(true);
    try {
      await onChangeEmail(email.trim(), password);
      setEmail("");
      setPassword("");
      setAttempted(false);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Change email" description="We'll send a confirmation link to the new address.">
      <Stack gap="md">
        {pendingEmail && (
          <Callout variant="info" icon={Mail} title="Check your inbox">
            You will receive an email at {pendingEmail} with instructions shortly. Your email changes once you follow the
            link.
          </Callout>
        )}
        <FormField label="New email address" htmlFor="new-email" required error={serverError ?? (attempted ? errors.email : undefined)}>
          <TextInput id="new-email" type="email" placeholder={currentEmail} value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Enter password to confirm" htmlFor="email-password" required error={attempted ? errors.password : undefined}>
          <TextInput
            id="email-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <Inline justify="end">
          <Button disabled={busy} onClick={submit}>
            {busy ? "Sending confirmation email…" : "Update email"}
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}
