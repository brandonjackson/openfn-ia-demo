import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import FirstSetupShell from "../../components/auth/FirstSetupShell";
import PasswordInput from "../../components/auth/PasswordInput";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { TextInput } from "../../components/Inputs";
import { Centered, PageContent } from "../../components/PageContent";

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
    /^[^\s@]+@[^\s@]+$/.test(f.email) &&
    f.password.length >= 8 &&
    f.password === f.passwordConfirmation;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/projects");
  };

  const row = (field: React.ReactNode) => (
    <div className="grid grid-cols-6 gap-6">
      <div className="col-span-3">{field}</div>
    </div>
  );

  return (
    <FirstSetupShell>
      <PageContent header={<Header title="Setup" loggedOut />}>
        <Centered>
          <p>
            Looks like this is a fresh install of OpenFn Lightning. Create a superuser account to manage projects and
            users.
          </p>
          <form id="superuser-registration-form" onSubmit={onSubmit}>
            {row(<TextInput id="first_name" label="First name" value={f.firstName} onChange={set("firstName")} />)}
            {row(<TextInput id="last_name" label="Last name" value={f.lastName} onChange={set("lastName")} />)}
            {row(<TextInput id="email" type="email" label="Email" value={f.email} onChange={set("email")} />)}
            {row(
              <PasswordInput
                id="password"
                label="Password"
                autoComplete="new-password"
                value={f.password}
                onChange={set("password")}
                errors={errors.password}
              />
            )}
            {row(
              <PasswordInput
                id="password_confirmation"
                label="Password confirmation"
                autoComplete="new-password"
                value={f.passwordConfirmation}
                onChange={set("passwordConfirmation")}
                errors={errors.passwordConfirmation}
              />
            )}
            <div className="mt-2">
              <Button type="submit" theme="primary" disabled={!valid}>
                Save
              </Button>
            </div>
          </form>
        </Centered>
      </PageContent>
    </FirstSetupShell>
  );
}
