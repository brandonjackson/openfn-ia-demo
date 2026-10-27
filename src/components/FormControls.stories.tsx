import type { Meta, StoryObj } from "@storybook/react";
import { TextInput, TextArea, Select, RadioOption } from "./FormControls";
import FormField from "./FormField";

const meta: Meta = {
  title: "Components/FormControls",
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

export const Text: Story = {
  render: () => <TextInput defaultValue="brandon-demo" />,
};

export const Password: Story = {
  render: () => <TextInput type="password" placeholder="Current password" />,
};

export const Disabled: Story = {
  render: () => <TextInput defaultValue="Read only value" disabled />,
};

export const MultiLine: Story = {
  render: () => <TextArea rows={3} defaultValue="A short description of a project." />,
};

export const Dropdown: Story = {
  render: () => <Select options={["7 Days", "14 Days", "30 Days"]} defaultValue="14 Days" />,
};

export const Radios: Story = {
  render: () => (
    <div className="space-y-2">
      <RadioOption name="demo" label="Retain input/output data" defaultChecked />
      <RadioOption name="demo" label="Never retain input/output data" />
    </div>
  ),
};

/** Radio options with a line of explanation each. */
export const RadiosWithHints: Story = {
  render: () => (
    <div className="space-y-2">
      <RadioOption name="hints" label="Nothing" hint="An empty sandbox. Pick input when you run." defaultChecked />
      <RadioOption name="hints" label="A saved input" hint="One of this project's named inputs." />
    </div>
  ),
};

export const InFormFields: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <FormField label="First name" htmlFor="first">
        <TextInput id="first" defaultValue="Jane" />
      </FormField>
      <FormField label="Contact preference" htmlFor="pref" hint="How often we contact you about your account.">
        <Select id="pref" options={["Anytime", "Critical only"]} className="w-full" />
      </FormField>
    </div>
  ),
};

/** The height of a `sm` Button, for a search beside one in a page header. */
export const CompactTextInput: Story = {
  render: () => <TextInput type="search" placeholder="Search projects…" compact className="w-56" />,
};
