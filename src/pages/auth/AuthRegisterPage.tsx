import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard, { AuthFooterLinks } from "../../components/auth/AuthCard";
import PasswordInput from "../../components/auth/PasswordInput";
import PlainTextResponse from "../../components/auth/PlainTextResponse";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import { Checkbox, TextInput } from "../../components/Inputs";
import { authFlags, signupDisabledMessage } from "../../mock-data/auth";

/**
 * Inventory view `auth-register` (user_registration_html/new.html.heex).
 * With `allowSignup` off (the default, as on demo.openfn.org) the router
 * answers with a bare text response; ?signup=1 shows the form.
 */
export default function AuthRegisterPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const flags = authFlags(search);

  if (!flags.allowSignup) return <PlainTextResponse>{signupDisabledMessage}</PlainTextResponse>;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/projects");
  };

  return (
    <AuthLayout title="Register">
      <div id="register">
        <form onSubmit={onSubmit}>
          <AuthCard>
            <TextInput id="user_first_name" label="First Name" required autoComplete="given-name" />
            <TextInput id="user_last_name" label="Last Name" required autoComplete="family-name" />
            <TextInput id="user_email" type="email" label="Email" required autoComplete="email" />
            <PasswordInput id="user_password" label="Password" required autoComplete="new-password" />
            <Checkbox
              id="user_terms_accepted"
              required
              label={<span className="font-medium">I accept the terms of service</span>}
              hint={
                <>
                  Please check with the host of this instance of Lightning to ensure that you understand, accept, and
                  are willing to abide by all of their terms and conditions. You can read the OpenFn.org terms of
                  service{" "}
                  <TextLink href="https://www.openfn.org/terms" target="_blank">
                    here
                  </TextLink>
                  .
                </>
              }
            />
            <Button type="submit">Register</Button>
            <AuthFooterLinks
              divider
              left={<TextLink variant="plain" to="/users/log_in">Log in</TextLink>}
              right={<TextLink variant="plain" to="/users/reset_password">Forgot your password?</TextLink>}
            />
          </AuthCard>
        </form>
      </div>
    </AuthLayout>
  );
}
