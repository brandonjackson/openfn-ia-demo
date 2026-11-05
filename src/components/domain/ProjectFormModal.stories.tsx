import type { Meta, StoryObj } from "@storybook/react";
import ProjectFormModal from "./ProjectFormModal";
import { adminUsers, instanceProjects } from "../../fixtures/admin";

const meta: Meta<typeof ProjectFormModal> = {
  title: "Domain/ProjectFormModal",
  component: ProjectFormModal,
  parameters: { layout: "fullscreen" },
  args: { users: adminUsers, onSave: async () => {}, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof ProjectFormModal>;

/** A new project has no owner yet, so it can't be saved until someone is given that role. */
export const NewProject: Story = {};

export const EditProject: Story = { args: { project: instanceProjects[0] } };
