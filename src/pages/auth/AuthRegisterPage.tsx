import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard, { AuthFooterLinks, AuthFormStack, FormDivider } from "../../components/auth/AuthCard";
import PasswordInput from "../../components/auth/PasswordInput";
import PlainTextResponse from "../../components/auth/PlainTextResponse";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import { Checkbox, Label, TextInput } from "../../components/Inputs";
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
            <AuthFormStack>
              <TextInput id="user_first_name" label="First Name" required autoComplete="given-name" />
              <TextInput id="user_last_name" label="Last Name" required autoComplete="family-name" />
              <TextInput id="user_email" type="email" label="Email" required autoComplete="email" />
              <PasswordInput id="user_password" label="Password" required autoComplete="new-password" />
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox id="user_terms_accepted" label="" required />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="user_terms_accepted" className="font-medium text-secondary-700">
                    I accept the terms of service
                  </Label>
                  <br />
                  <span className="text-xs text-secondary-500">
                    Please check with the host of this instance of Lightning to ensure that you understand, accept,
                    and are willing to abide by all of their terms and conditions. You can read the OpenFn.org terms
                    of service{" "}
                    <TextLink href="https://www.openfn.org/terms" target="_blank" className="font-normal">
                      here
                    </TextLink>
                    .
                  </span>
                </div>
              </div>
              <Button type="submit" theme="primary">
                Register
              </Button>
            </AuthFormStack>
            <FormDivider />
            <AuthFooterLinks
              left={<Link to="/users/log_in">Log in</Link>}
              right={<Link to="/users/reset_password">Forgot your password?</Link>}
            />
          </AuthCard>
        </form>
      </div>
    </AuthLayout>
  );
}
