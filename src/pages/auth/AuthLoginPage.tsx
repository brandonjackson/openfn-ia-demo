import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard, { AuthFooterLinks, AuthFormStack, FormDivider } from "../../components/auth/AuthCard";
import PasswordInput from "../../components/auth/PasswordInput";
import SsoLogin from "../../components/auth/SsoLogin";
import Button from "../../components/Button";
import { Checkbox, TextInput } from "../../components/Inputs";
import { authFlags, authMessages } from "../../mock-data/auth";

/**
 * Inventory view `auth-login` (user_session_html/new.html.heex).
 * No real auth: submitting goes straight to /projects.
 * Demo flags: ?sso=1 shows the external-provider button, ?signup=1 the
 * Register link, ?error=1 the invalid-login flash.
 */
export default function AuthLoginPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const flags = authFlags(search);
  const showError = new URLSearchParams(search).has("error");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/projects");
  };

  return (
    <AuthLayout title="Log in">
      <div id="login">
        <form onSubmit={onSubmit}>
          <AuthCard error={showError ? authMessages.invalidLogin : undefined}>
            <AuthFormStack>
              <TextInput id="user_email" name="email" type="email" label="Email" required autoComplete="email" />
              <PasswordInput id="user_password" name="password" label="Password" autoComplete="current-password" />
              <Checkbox id="user_remember_me" name="remember_me" label="Remember me" hint="Keep me logged in for 60 days" />
              <Button type="submit" theme="primary">
                Log in
              </Button>
              {flags.ssoProvider && <SsoLogin provider={flags.ssoProvider} />}
            </AuthFormStack>
            <FormDivider />
            <AuthFooterLinks
              left={flags.allowSignup && <Link to="/users/register">Register</Link>}
              right={<Link to="/users/reset_password">Forgot your password?</Link>}
            />
          </AuthCard>
        </form>
      </div>
    </AuthLayout>
  );
}
