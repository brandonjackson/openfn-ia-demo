import type { Meta, StoryObj } from "@storybook/react";
import Modal from "./Modal";
import Button from "./Button";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
  args: { open: true, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    title: "Dialog title",
    children: <p className="text-sm text-gray-600">Body content goes here.</p>,
  },
};

export const WithFooter: Story = {
  args: {
    ...Default.args,
    footer: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button>Confirm</Button>
      </>
    ),
  },
};
