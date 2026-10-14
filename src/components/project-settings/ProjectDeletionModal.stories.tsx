import type { Meta, StoryObj } from "@storybook/react";
import ProjectDeletionModal from "./ProjectDeletionModal";
import { projects } from "../../mock-data/projects";

const meta: Meta<typeof ProjectDeletionModal> = {
  title: "Project settings/ProjectDeletionModal",
  component: ProjectDeletionModal,
  args: { project: projects[0], gracePeriodDays: 7, onCancel: () => {}, onDelete: () => {} },
};
export default meta;
type Story = StoryObj<typeof ProjectDeletionModal>;

export const Default: Story = {};
export const NoGracePeriod: Story = { args: { gracePeriodDays: 0 } };
