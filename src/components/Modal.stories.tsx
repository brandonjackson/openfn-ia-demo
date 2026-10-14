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
    subtitle: "Projects hold workflows, credentials and history.",
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
export const NoTitle: Story = { args: { title: undefined, subtitle: undefined } };
