import type { Meta, StoryObj } from "@storybook/react";
import FormField from "./FormField";
import { TextInput } from "./FormControls";

const meta: Meta<typeof FormField> = {
  title: "Primitives/FormField",
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

export const WithError: Story = {
  args: {
    label: "Name",
    htmlFor: "collection-name",
    hint: "Your collection will be named my-collection.",
    error: "A collection with this name already exists",
    children: <TextInput id="collection-name" defaultValue="applicant-cache" />,
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

/** The label is read out but not drawn, for a row of fields under one set of headings. */
export const HiddenLabel: Story = {
  args: {
    label: "Key",
    htmlFor: "env-key",
    hideLabel: true,
    error: "Enter a key",
    children: <TextInput id="env-key" mono placeholder="e.g. API_URL" />,
  },
};
