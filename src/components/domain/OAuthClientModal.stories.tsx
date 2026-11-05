import type { Meta, StoryObj } from "@storybook/react";
import OAuthClientModal from "./OAuthClientModal";
import { userOAuthClients } from "../../fixtures/user";
import { projectOptions } from "../../fixtures/projects";

const meta: Meta<typeof OAuthClientModal> = {
  title: "Domain/OAuthClientModal",
  component: OAuthClientModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    projects: projectOptions,
    onSave: async () => {},
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof OAuthClientModal>;

/** Registering a new client, shared with chosen projects. */
export const New: Story = {};

/** A superuser can make it global, so every project can use it. */
export const NewAsSuperuser: Story = {
  args: { canMakeGlobal: true },
};

/** Editing a client: the secret isn't shown back, and a blank one keeps it. */
export const Edit: Story = {
  args: { client: userOAuthClients[1] },
};

/** Editing a global client as a superuser. */
export const EditGlobal: Story = {
  args: { client: userOAuthClients[0], canMakeGlobal: true },
};
