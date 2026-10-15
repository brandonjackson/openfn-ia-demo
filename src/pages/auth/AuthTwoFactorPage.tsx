import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthPanelLayout, {
  AuthPanel,
  AuthPanelHint,
  AuthPanelTitle,
  HavingProblems,
} from "../../components/auth/AuthPanelLayout";
import Alert from "../../components/Alert";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import { TextInput } from "../../components/Inputs";
import { authMessages } from "../../constants";
import type { TwoFactorMethod } from "../../types/auth";

/**
 * Inventory view `auth-two-factor` (user_totp_html/new.html.heex).
 * ?authentication_type=backup_code switches to the backup-code form, as in
 * Lightning; ?error=1 shows the invalid-code message. Any code is accepted.
 */
export default function AuthTwoFactorPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(search);
  const method: TwoFactorMethod = q.get("authentication_type") === "backup_code" ? "backup_code" : "totp";
  const other: TwoFactorMethod = method === "totp" ? "backup_code" : "totp";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/projects");
  };

  return (
    <AuthPanelLayout title="Two-factor authentication">
      <AuthPanel>
        <AuthPanelTitle>{method === "backup_code" ? "Backup Code" : "Authentication Code"}</AuthPanelTitle>
        {q.has("error") && <Alert type="danger">{authMessages.invalidTwoFactorCode}</Alert>}
        <form onSubmit={onSubmit} className="space-y-4">
          <TextInput
            id="user_code"
            name="code"
            required
            autoComplete="one-time-code"
            inputMode="numeric"
            placeholder="XXXXXX"
          />
          <Button type="submit" size="lg" className="w-full">
            Verify
          </Button>
          <AuthPanelHint>
            {method === "totp"
              ? "Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code."
              : "Use one of your backup codes. Kindly note that a backup code can only be used once"}
          </AuthPanelHint>
        </form>
      </AuthPanel>
      <HavingProblems>
        <li>
          <TextLink to={`/users/two-factor?authentication_type=${other}`}>
            {method === "totp" ? "Use your backup code" : "Use your authenticator app"}
          </TextLink>
        </li>
      </HavingProblems>
    </AuthPanelLayout>
  );
}
