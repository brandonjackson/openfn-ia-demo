import type { Meta, StoryObj } from "@storybook/react";
import OAuthClientTable from "./OAuthClientTable";
import { userOAuthClients } from "../../fixtures/user";
import { projectOptions } from "../../fixtures/projects";

const meta: Meta<typeof OAuthClientTable> = {
  title: "Domain/OAuthClientTable",
  component: OAuthClientTable,
  parameters: { layout: "padded" },
  args: { clients: userOAuthClients, projects: projectOptions, onEdit: () => {}, onDelete: () => {} },
};

export default meta;
type Story = StoryObj<typeof OAuthClientTable>;

/** A global client and one shared with a single project. */
export const Default: Story = {};

export const ReadOnly: Story = {
  args: { onEdit: undefined, onDelete: undefined },
};

export const Empty: Story = {
  args: { clients: [] },
};
