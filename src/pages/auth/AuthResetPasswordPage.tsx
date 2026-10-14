import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard, { AuthFooterLinks, AuthFormStack, FormDivider } from "../../components/auth/AuthCard";
import PasswordInput from "../../components/auth/PasswordInput";
import Button from "../../components/Button";
import { Label, TextInput } from "../../components/Inputs";
import { authFlags } from "../../mock-data/auth";

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
  const registerLink = flags.allowSignup && <Link to="/users/register">Register</Link>;

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
              <AuthFormStack>
                <TextInput id="user_email" type="email" label="Email" required />
                <Button type="submit" theme="primary">
                  Send instructions to reset password
                </Button>
                <AuthFooterLinks left={<Link to="/users/log_in">Log in</Link>} right={registerLink} />
              </AuthFormStack>
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
            <AuthFormStack>
              <div>
                <Label htmlFor="user_password">New password</Label>
                <PasswordInput id="user_password" name="password" required autoComplete="new-password" />
              </div>
              <div>
                <Label htmlFor="user_password_confirmation">Confirm new password</Label>
                <PasswordInput
                  id="user_password_confirmation"
                  name="password_confirmation"
                  required
                  autoComplete="new-password"
                  errors={mismatch ? ["does not match password"] : []}
                />
              </div>
              <Button type="submit" theme="primary">
                Reset password
              </Button>
              <FormDivider />
              <AuthFooterLinks left={<Link to="/users/log_in">Log in</Link>} right={registerLink} />
            </AuthFormStack>
          </AuthCard>
        </form>
      </div>
    </AuthLayout>
  );
}
