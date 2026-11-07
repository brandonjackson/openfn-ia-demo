import type { Meta, StoryObj } from "@storybook/react";
import CollaboratorTable from "./CollaboratorTable";
import { projects } from "../../fixtures/projects";
import { projectCollaborators, projectSettingsRecord } from "../../fixtures/project-settings";

const [projectA] = projects;
const record = projectSettingsRecord(projectA);

const meta: Meta<typeof CollaboratorTable> = {
  title: "Domain/CollaboratorTable",
  component: CollaboratorTable,
  parameters: { layout: "padded" },
  args: {
    collaborators: projectCollaborators(record),
    onChangeRole: () => {},
    onSetFailureAlert: () => {},
    onSetDigest: () => {},
    onRemove: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CollaboratorTable>;

/** As the project's owner: every other role can change, and anyone but you and the owner can be removed. */
export const AsOwner: Story = {};

/** As an editor: only your own alerts and digest. */
export const AsEditor: Story = {
  args: {
    collaborators: projectCollaborators(record, "jsmith@example.org"),
    onChangeRole: undefined,
    onRemove: undefined,
  },
};
