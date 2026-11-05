import type { Meta, StoryObj } from "@storybook/react";
import AddCollaboratorsModal from "./AddCollaboratorsModal";
import { projectMemberships } from "../../fixtures/project-settings";

const meta: Meta<typeof AddCollaboratorsModal> = {
  title: "Domain/AddCollaboratorsModal",
  component: AddCollaboratorsModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    existingEmails: projectMemberships("project-a").map((m) => m.email),
    onClose: () => {},
    onAdd: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AddCollaboratorsModal>;

export const Default: Story = {};
