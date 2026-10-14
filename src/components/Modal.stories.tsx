import type { Meta, StoryObj } from "@storybook/react";
import Modal from "./Modal";
import Button from "./Button";
import { TextInput } from "./Inputs";

const meta: Meta<typeof Modal> = {
  title: "Shared/Modal",
  component: Modal,
  args: {
    open: true,
    onClose: () => {},
    title: "Create a new project",
    description: "Projects hold workflows, credentials and history.",
    children: <TextInput id="name" label="Name" required placeholder="my-project" />,
    footer: (
      <>
        <Button>Create</Button>
        <Button theme="secondary">Cancel</Button>
      </>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const ExtraLarge: Story = { args: { size: "xl" } };
export const NoTitle: Story = { args: { title: undefined, description: undefined } };
export const Bare: Story = {
  args: {
    bare: true,
    size: "xl",
    children: <div className="h-64 rounded-xl bg-gray-50 p-6 text-sm text-gray-500">A modal that lays out its own content.</div>,
  },
};
