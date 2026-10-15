import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import FirstSetupShell from "../../components/auth/FirstSetupShell";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { PasswordInput, TextInput } from "../../components/Inputs";
import { Centered, PageContent } from "../../components/PageContent";
import { isValidEmail } from "../../utils/validate";

type Fields = { firstName: string; lastName: string; email: string; password: string; passwordConfirmation: string };

/**
 * Inventory view `first-setup` (first_setup_live/superuser.html.heex).
 * Lightning validates on change; here Save enables once the fields would
 * pass the same checks (names, email, password ≥ 8 and matching), and
 * saving goes to /projects.
 */
export default function FirstSetupPage() {
  const navigate = useNavigate();
  const [f, setF] = useState<Fields>({ firstName: "", lastName: "", email: "", password: "", passwordConfirmation: "" });
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const errors = {
    password: f.password && f.password.length < 8 ? ["should be at least 8 character(s)"] : [],
    passwordConfirmation:
      f.passwordConfirmation && f.passwordConfirmation !== f.password ? ["does not match password"] : [],
  };
  const valid =
    f.firstName.trim() !== "" &&
    f.lastName.trim() !== "" &&
    isValidEmail(f.email) &&
    f.password.length >= 8 &&
    f.password === f.passwordConfirmation;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/projects");
  };

  return (
    <FirstSetupShell>
      <PageContent header={<Header title="Setup" loggedOut />}>
        <Centered>
          <p>
            Looks like this is a fresh install of OpenFn Lightning. Create a superuser account to manage projects and
            users.
          </p>
          <form id="superuser-registration-form" onSubmit={onSubmit} className="mt-4 grid w-1/2 gap-4">
            <TextInput id="first_name" label="First name" value={f.firstName} onChange={set("firstName")} />
            <TextInput id="last_name" label="Last name" value={f.lastName} onChange={set("lastName")} />
            <TextInput id="email" type="email" label="Email" value={f.email} onChange={set("email")} />
            <PasswordInput
              id="password"
              label="Password"
              autoComplete="new-password"
              value={f.password}
              onChange={set("password")}
              errors={errors.password}
            />
            <PasswordInput
              id="password_confirmation"
              label="Password confirmation"
              autoComplete="new-password"
              value={f.passwordConfirmation}
              onChange={set("passwordConfirmation")}
              errors={errors.passwordConfirmation}
            />
            <Button type="submit" disabled={!valid} className="justify-self-start">
              Save
            </Button>
          </form>
        </Centered>
      </PageContent>
    </FirstSetupShell>
  );
}
