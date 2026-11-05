import type { Meta, StoryObj } from "@storybook/react";
import SandboxFormModal from "./SandboxFormModal";
import { projects, projectSandboxes } from "../../fixtures/projects";

const sandboxes = projectSandboxes(projects[0]);

const meta: Meta<typeof SandboxFormModal> = {
  title: "Domain/SandboxFormModal",
  component: SandboxFormModal,
  args: { open: true, sandboxes, onClose: () => {}, onSubmit: async () => {} },
};
export default meta;
type Story = StoryObj<typeof SandboxFormModal>;

export const New: Story = {};
export const Edit: Story = { args: { sandbox: sandboxes[1] } };
