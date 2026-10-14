import type { Meta, StoryObj } from "@storybook/react";
import TextField, { SelectField } from "./FormField";

const meta: Meta<typeof TextField> = {
  title: "Workflow/FormField",
  component: TextField,
  decorators: [(Story) => <div className="w-96 p-6"><Story /></div>],
  args: { name: "name", label: "Job Name", defaultValue: "Transform data to FHIR standard" },
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Text: Story = {};
export const NumberWithHelp: Story = {
  args: { name: "concurrency", label: "Max Concurrency", type: "number", defaultValue: undefined, placeholder: "Unlimited (up to max available)", helpText: "Unlimited (up to max available)" },
};
export const Select: Story = {
  render: () => (
    <SelectField
      name="condition_type"
      label="Condition"
      value="on_job_success"
      onChange={() => {}}
      options={[
        { value: "always", label: "Always" },
        { value: "on_job_success", label: "On Success" },
      ]}
    />
  ),
};
