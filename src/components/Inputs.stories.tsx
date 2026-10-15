import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Field, PasswordInput, Radio, Select, TextArea, TextInput } from "./Inputs";
import { controlClasses } from "./controlClasses";

const meta: Meta = { title: "Shared/Inputs" };
export default meta;
type Story = StoryObj;

export const Text: Story = { render: () => <TextInput id="email" label="Email" required placeholder="you@example.org" /> };
export const TextWithHint: Story = {
  render: () => <TextInput id="name" label="Name" hint="Lowercase letters, numbers and dashes." placeholder="my-project" />,
};
export const TextWithError: Story = {
  render: () => <TextInput id="name" label="Name" defaultValue="" errors={["can't be blank"]} />,
};
export const Disabled: Story = { render: () => <TextInput id="id" label="Project ID" value="4adf2644" disabled readOnly /> };
export const Password: Story = { render: () => <PasswordInput id="password" label="Password" required /> };
export const PasswordWithError: Story = {
  render: () => <PasswordInput id="password" label="Password" errors={["should be at least 8 character(s)"]} defaultValue="short" />,
};
export const Area: Story = { render: () => <TextArea id="desc" label="Description" rows={3} /> };
export const Dropdown: Story = {
  render: () => <Select id="role" label="Role" options={["viewer", "editor", "admin", "owner"]} prompt="Choose a role" />,
};
export const DropdownWithObjects: Story = {
  render: () => (
    <Select
      id="adaptor"
      label="Adaptor"
      options={[
        { label: "HTTP", value: "@openfn/language-http" },
        { label: "DHIS2", value: "@openfn/language-dhis2" },
      ]}
    />
  ),
};
export const Check: Story = { render: () => <Checkbox label="Remember me" defaultChecked /> };
export const CheckWithHint: Story = {
  render: () => <Checkbox label="Require MFA" hint="Collaborators must set up two-factor authentication." />,
};
export const Radios: Story = {
  render: () => (
    <div className="space-y-2">
      <Radio name="auth" label="Basic" defaultChecked />
      <Radio name="auth" label="API key" />
    </div>
  ),
};
export const CustomControlInField: Story = {
  render: () => (
    <Field id="when" label="Run after" hint="Pick a date and time.">
      <input id="when" type="datetime-local" data-ui="field" className={controlClasses()} />
    </Field>
  ),
};
export const Indeterminate: Story = { render: () => <Checkbox label="Select all work orders" indeterminate /> };
/** `fieldClassName` styles the field wrapper, so inputs can share a flex row. */
export const GrowInRow: Story = {
  render: () => (
    <div className="flex items-end gap-2">
      <TextInput id="first" label="First name" fieldClassName="flex-1" />
      <TextInput id="last" label="Last name" fieldClassName="flex-1" />
      <Select id="role" label="Role" options={["viewer", "editor", "admin"]} fieldClassName="w-40" />
    </div>
  ),
};
