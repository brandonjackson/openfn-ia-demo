import { useState, type FormEvent } from "react";
import AuthPanelLayout, { AuthPanel } from "../../components/auth/AuthPanelLayout";
import Alert from "../../components/Alert";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import Heading from "../../components/Heading";
import { PasswordInput, TextInput } from "../../components/Inputs";
import { unconfirmedUser } from "../../mock-data/auth";
import { isValidEmail } from "../../utils/validate";

/**
 * Inventory view `auth-confirmation-required`
 * (user_confirmation_required_live.html.heex). Resend just shows the "sent"
 * alert; Update email shows the "change requested" alert. The throttled and
 * send-failed alerts (server outcomes) are in the Alert stories.
 */
export default function AuthConfirmationRequiredPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [changeRequested, setChangeRequested] = useState<string | null>(null);
  const valid = isValidEmail(newEmail) && newEmail !== unconfirmedUser.email && password.length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setChangeRequested(newEmail);
  };

  return (
    <AuthPanelLayout title="Confirm your email address" align="top">
      <AuthPanel className="text-sm text-gray-600">
        <p>
          Your account is blocked pending email confirmation. We sent a confirmation link to{" "}
          <span className="font-medium">{unconfirmedUser.email}</span> when you signed up — open it
          to keep using OpenFn.
        </p>
        <p>
          If that link has expired, request a new one. If the address above is wrong, correct it below and we will
          send the link there instead.
        </p>
        {emailSent && (
          <Alert type="info" id="confirmation-email-sent">
            We have sent a new confirmation link to {unconfirmedUser.email}.
          </Alert>
        )}
        {changeRequested && (
          <Alert type="info" id="email-change-requested">
            We have sent confirmation instructions to {changeRequested}.
          </Alert>
        )}
        <Button id="resend-confirmation-email-button" onClick={() => setEmailSent(true)}>
          Resend confirmation email
        </Button>
      </AuthPanel>

      <AuthPanel>
        <form id="email-form" onSubmit={onSubmit} className="space-y-4">
          <Heading as="h2">Change email address</Heading>
          <TextInput
            id="user_email"
            type="email"
            label="New email address"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <PasswordInput
            id="user_current_password"
            label="Enter password to confirm"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={!valid}>
            Update email
          </Button>
        </form>
      </AuthPanel>

      <TextLink className="text-sm" to="/users/log_in">
        Log out
      </TextLink>
    </AuthPanelLayout>
  );
}
