import { useLocation, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard, { AuthFooterLinks } from "../../components/auth/AuthCard";
import Button from "../../components/Button";
import { TextInput } from "../../components/Inputs";
import { authFlags } from "../../mock-data/auth";
import TextLink from "../../components/TextLink";

/**
 * Inventory view `auth-confirm-account`.
 * /users/confirm: resend instructions (user_confirmation_html/new).
 * /users/confirm/:token: one-button confirm (edit).
 * Lightning redirects to /projects with a flash after either submit.
 */
export default function AuthConfirmAccountPage() {
  const { token } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const flags = authFlags(search);
  const footer = (
    <AuthFooterLinks
      left={<TextLink variant="plain" to="/users/log_in">Log in</TextLink>}
      right={flags.allowSignup && <TextLink variant="plain" to="/users/register">Register</TextLink>}
    />
  );
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/projects");
  };

  return (
    <AuthLayout title={token ? "Confirm account" : "Resend confirmation instructions"}>
      <div id="reset-password">
        <form onSubmit={onSubmit}>
          <AuthCard>
            {token ? (
              <Button type="submit">Confirm my account</Button>
            ) : (
              <>
                <TextInput id="user_email" type="email" label="Email" required />
                <Button type="submit">Resend confirmation instructions</Button>
              </>
            )}
            {footer}
          </AuthCard>
        </form>
      </div>
    </AuthLayout>
  );
}
