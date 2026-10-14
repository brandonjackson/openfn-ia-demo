import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthPanelLayout, {
  AuthPanel,
  AuthPanelHint,
  AuthPanelTitle,
  HavingProblems,
} from "../../components/auth/AuthPanelLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import UserAvatar from "../../components/UserAvatar";
import { TextInput } from "../../components/Inputs";
import { currentUser } from "../../mock-data/users";

const fieldClasses =
  "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5";

/**
 * Inventory view `auth-confirm-access` (re_authenticate_live/new.html.heex):
 * the sudo-mode re-authentication page. Password by default; the
 * authenticator option appears when the user has MFA on. Any input is
 * accepted and returns to the profile page.
 */
export default function AuthConfirmAccessPage() {
  const navigate = useNavigate();
  const [option, setOption] = useState<"password" | "totp">("password");
  const user = currentUser;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/profile");
  };

  return (
    <AuthPanelLayout title="Confirm access">
      <AuthPanel size="sm">
        <div className="flex items-center justify-center">
          <UserAvatar firstName={user.firstName} lastName={user.lastName} size="sm" />
        </div>
        <p className="text-center">
          Signed in as: <span className="font-bold">{`${user.firstName} ${user.lastName}`}</span>
        </p>
      </AuthPanel>
      <AuthPanel>
        <AuthPanelTitle>{option === "password" ? "Password" : "Authentication Code"}</AuthPanelTitle>
        <form id="reauthentication-form" onSubmit={onSubmit} className="space-y-4 md:space-y-6">
          {option === "password" ? (
            <PasswordInput
              id="user_password"
              name="password"
              required
              autoComplete="current-password"
              className={`${fieldClasses} rounded-lg`}
            />
          ) : (
            <TextInput
              id="user_code"
              name="code"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="XXXXXX"
              className={fieldClasses}
            />
          )}
          <Button type="submit" theme="primary" className="w-full">
            {option === "password" ? "Confirm" : "Verify"}
          </Button>
          <AuthPanelHint>
            {option === "totp"
              ? "Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code."
              : "Enter your password to confirm access"}
          </AuthPanelHint>
        </form>
      </AuthPanel>
      <HavingProblems>
        {option === "password" && user.mfaEnabled && (
          <li>
            <TextLink className="font-medium" onClick={() => setOption("totp")}>Use your authenticator app instead</TextLink>
          </li>
        )}
        {option === "totp" && (
          <li>
            <TextLink className="font-medium" onClick={() => setOption("password")}>Use your password instead</TextLink>
          </li>
        )}
      </HavingProblems>
    </AuthPanelLayout>
  );
}
