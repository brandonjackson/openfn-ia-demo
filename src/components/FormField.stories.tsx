import type { Meta, StoryObj } from "@storybook/react";
import FormField from "./FormField";
import { TextInput } from "./FormControls";

const meta: Meta<typeof FormField> = {
  title: "Components/FormField",
  component: FormField,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: "Project name",
    htmlFor: "project-name",
    children: <TextInput id="project-name" defaultValue="brandon-demo" />,
  },
};

export const WithHint: Story = {
  args: {
    label: "Project environment",
    htmlFor: "env",
    hint: "Credentials will be loaded with values from this environment.",
    children: <TextInput id="env" defaultValue="main" />,
  },
};
