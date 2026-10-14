import { useState, type FormEvent } from "react";
import AuthPanelLayout from "../../components/auth/AuthPanelLayout";
import Alert from "../../components/auth/Alert";
import PasswordInput from "../../components/auth/PasswordInput";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import { TextInput } from "../../components/Inputs";
import { unconfirmedUser } from "../../mock-data/auth";

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
  const valid = /^[^\s@]+@[^\s@]+$/.test(newEmail) && newEmail !== unconfirmedUser.email && password.length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setChangeRequested(newEmail);
  };

  return (
    <AuthPanelLayout title="Confirm your email address" align="top">
      <div className="w-full sm:max-w-md space-y-4">
        <div className="bg-white rounded-lg shadow p-6 space-y-4 text-sm text-gray-600">
          <p>
            Your account is blocked pending email confirmation. We sent a confirmation link to{" "}
            <span className="font-medium text-gray-900">{unconfirmedUser.email}</span> when you signed up — open it
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
          <Button id="resend-confirmation-email-button" theme="primary" onClick={() => setEmailSent(true)}>
            Resend confirmation email
          </Button>
        </div>

        <form id="email-form" onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="text-base font-medium text-gray-900">Change email address</div>
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
          <Button type="submit" theme="primary" disabled={!valid}>
            Update email
          </Button>
        </form>

        <p className="text-sm text-gray-500 text-center">
          <TextLink className="font-medium" to="/users/log_in">Log out</TextLink>
        </p>
      </div>
    </AuthPanelLayout>
  );
}
