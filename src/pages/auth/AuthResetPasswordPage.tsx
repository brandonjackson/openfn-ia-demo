import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard, { AuthFooterLinks } from "../../components/auth/AuthCard";
import Button from "../../components/Button";
import { PasswordInput, TextInput } from "../../components/Inputs";
import { authFlags } from "../../mock-data/auth";
import TextLink from "../../components/TextLink";

/**
 * Inventory view `auth-reset-password`.
 * /users/reset_password: request form (user_reset_password_html/new).
 * /users/reset_password/:token: set a new password (edit).
 * Lightning redirects after either submit (to /projects with a flash, and to
 * the login page); here both go to /users/log_in.
 */
export default function AuthResetPasswordPage() {
  const { token } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const flags = authFlags(search);
  const [mismatch, setMismatch] = useState(false);
  const registerLink = flags.allowSignup && <TextLink variant="plain" to="/users/register">Register</TextLink>;

  if (!token) {
    return (
      <AuthLayout title="Forgot your password?">
        <div id="reset-password-new">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/users/log_in");
            }}
          >
            <AuthCard>
              <TextInput id="user_email" type="email" label="Email" required />
              <Button type="submit">Send instructions to reset password</Button>
              <AuthFooterLinks left={<TextLink variant="plain" to="/users/log_in">Log in</TextLink>} right={registerLink} />
            </AuthCard>
          </form>
        </div>
      </AuthLayout>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("password") !== data.get("password_confirmation")) {
      setMismatch(true);
      return;
    }
    navigate("/users/log_in");
  };

  return (
    <AuthLayout title="Reset password">
      <div id="reset-password-edit">
        <form onSubmit={onSubmit}>
          <AuthCard>
            <PasswordInput id="user_password" name="password" label="New password" required autoComplete="new-password" />
            <PasswordInput
              id="user_password_confirmation"
              name="password_confirmation"
              label="Confirm new password"
              required
              autoComplete="new-password"
              errors={mismatch ? ["does not match password"] : []}
            />
            <Button type="submit">Reset password</Button>
            <AuthFooterLinks divider left={<TextLink variant="plain" to="/users/log_in">Log in</TextLink>} right={registerLink} />
          </AuthCard>
        </form>
      </div>
    </AuthLayout>
  );
}
