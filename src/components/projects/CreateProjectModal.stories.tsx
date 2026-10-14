import type { Meta, StoryObj } from "@storybook/react";
import CreateProjectModal from "./CreateProjectModal";

const meta: Meta<typeof CreateProjectModal> = {
  title: "Projects/CreateProjectModal",
  component: CreateProjectModal,
  args: { open: true, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof CreateProjectModal>;

export const Open: Story = {};
