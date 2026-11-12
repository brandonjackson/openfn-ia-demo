import { useState, type FormEvent } from "react";
import Button from "../../../components/primitives/Button";
import Callout from "../../../components/primitives/Callout";
import Code from "../../../components/primitives/Code";
import CodeBlock from "../../../components/primitives/CodeBlock";
import FormField from "../../../components/primitives/FormField";
import { Select, TextArea, TextInput } from "../../../components/primitives/FormControls";
import { focusFirstProblem } from "../../../components/primitives/focus-field";
import Inline from "../../../components/primitives/Inline";
import Stack from "../../../components/primitives/Stack";
import ToggleSwitch from "../../../components/primitives/ToggleSwitch";
import { Bullets, DocPage, P, Section, SubHeading } from "../../parts/Doc";
import { DoDont, Example } from "../../parts/Example";

/** A real form, following every rule on this page. Try submitting it empty, or naming it "taken". */
function ProjectForm() {
  const [name, setName] = useState("");
  const [env, setEnv] = useState("");
  const [errors, setErrors] = useState<{ name?: string; env?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return; // A second press while saving does nothing.
    const problems = { name: name.trim() ? undefined : "Enter a project name", env: env ? undefined : "Choose an environment" };
    setErrors(problems);
    if (focusFirstProblem([["docs-project-name", problems.name], ["docs-project-env", problems.env]])) return;
    setSaving(true);
    setSaved(null);
    // Stands in for the wrapper's onCreateProject, which returns a promise.
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    if (name.trim() === "taken") {
      setErrors({ name: "A project with this name already exists" });
      document.getElementById("docs-project-name")?.focus();
      return;
    }
    setSaved(name.trim());
  };

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {saved && <Callout variant="success" role="status" title={`Made ${saved}`} />}
        <FormField label="Project name" htmlFor="docs-project-name" required error={errors.name} hint="Lowercase, with hyphens. Try “taken”.">
          <TextInput id="docs-project-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} />
        </FormField>
        <FormField label="Environment" htmlFor="docs-project-env" required error={errors.env}>
          <Select
            id="docs-project-env"
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            placeholder="Choose…"
            options={[
              { value: "production", label: "Production" },
              { value: "staging", label: "Staging" },
            ]}
          />
        </FormField>
        <Inline>
          <Button type="submit" aria-disabled={saving || undefined}>
            {saving ? "Making project…" : "Make project"}
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}

/** How every form, modal and confirm behaves. */
export default function Forms() {
  const [on, setOn] = useState(true);
  return (
    <DocPage
      eyebrow="Guidelines"
      title="Forms"
      lead="Every form in OpenFn behaves the same way: the submit button is always there to press, and pressing it either does the thing or says exactly what's missing, beside the field it's about."
    >
      <Section title="Try it">
        <P>This is a real form built from the library. Submit it empty, then try naming the project "taken".</P>
        <Example column>
          <ProjectForm />
        </Example>
      </Section>

      <Section title="Never disable a submit button to say a form isn't ready">
        <P>
          A disabled button can't be focused, isn't read out, and doesn't say why. So keep it enabled. On submit, check the
          form, say what's missing under the field it's about (<Code>FormField</Code>'s <Code>error</Code>), and move focus
          to the first field with a problem (<Code>focusFirstProblem</Code>).
        </P>
        <DoDont
          doExample={
            <Stack gap="sm">
              <FormField label="Name" htmlFor="docs-dd-do" error="Enter a project name">
                <TextInput id="docs-dd-do" />
              </FormField>
              <Inline>
                <Button>Make project</Button>
              </Inline>
            </Stack>
          }
          doText="The button works; the message says what to do, where."
          dontExample={
            <Stack gap="sm">
              <FormField label="Name" htmlFor="docs-dd-dont">
                <TextInput id="docs-dd-dont" />
              </FormField>
              <Inline>
                <Button disabled>Make project</Button>
              </Inline>
            </Stack>
          }
          dontText="A grey button and no reason. Keyboard and screen reader users can't even reach it."
        />
      </Section>

      <Section title="While it saves">
        <P>
          The button says what's happening ("Saving…", "Making project…") and is marked <Code>aria-disabled</Code>, not{" "}
          <Code>disabled</Code>, so it keeps focus and its new label is read out. The handler ignores a second press.
        </P>
        <CodeBlock
          tone="light"
          code={`<Button type="submit" aria-disabled={saving || undefined}>
  {saving ? "Saving…" : "Save changes"}
</Button>

const submit = async (e: FormEvent) => {
  e.preventDefault();
  if (saving) return;
  …
};`}
        />
        <P>
          A refusal from the server goes under the field it names. An <Code>ApiError</Code> carries the field:{" "}
          <Code>error.fieldError("name")</Code>. Anything else shows as a <Code>Callout</Code> with <Code>role="alert"</Code>{" "}
          above the form.
        </P>
      </Section>

      <Section title="Fields">
        <P>
          Every control sits in a <Code>FormField</Code>, which draws its label, an optional hint and the error in place of
          the hint. Mark a field <Code>required</Code> or <Code>optional</Code>, whichever there are fewer of.
        </P>
        <Example
          column
          code={`<FormField label="Description" htmlFor="desc" optional hint="Shown on the project's card.">
  <TextArea id="desc" rows={2} />
</FormField>
<ToggleSwitch label="Require MFA" detail="Members must set up two-factor sign-in." checked={on} onChange={setOn} />`}
        >
          <FormField label="Description" htmlFor="docs-desc" optional hint="Shown on the project's card.">
            <TextArea id="docs-desc" rows={2} />
          </FormField>
          <ToggleSwitch label="Require MFA" detail="Members must set up two-factor sign-in." checked={on} onChange={setOn} />
        </Example>
        <SubHeading>Which control</SubHeading>
        <Bullets
          items={[
            <><Code>TextInput</Code> and <Code>TextArea</Code> for words; <Code>mono</Code> for keys, ids and code.</>,
            <><Code>Select</Code> for one of many, with <Code>{`{ value, label }`}</Code> options; <Code>RadioOption</Code> when the choices need explaining.</>,
            <><Code>ToggleSwitch</Code> for a setting that takes effect at once; <Code>Checkbox</Code> for one that's saved with the form.</>,
            <><Code>ConfirmModal</Code> with a <Code>confirmPhrase</Code> to type before something that destroys a lot.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
