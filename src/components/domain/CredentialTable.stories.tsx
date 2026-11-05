import type { Meta, StoryObj } from "@storybook/react";
import CredentialTable from "./CredentialTable";
import { userCredentials } from "../../fixtures/user";
import { credentialSchemas } from "../../fixtures/credential-schemas";
import { projectOptions } from "../../fixtures/projects";

const meta: Meta<typeof CredentialTable> = {
  title: "Domain/CredentialTable",
  component: CredentialTable,
  parameters: { layout: "padded" },
  args: {
    credentials: userCredentials,
    schemas: credentialSchemas,
    projects: projectOptions,
    onEdit: () => {},
    onTransfer: () => {},
    onDelete: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CredentialTable>;

/** Your credentials, one being handed to a colleague. */
export const Default: Story = {};

/** Without the callbacks there's no ⋮, e.g. for someone who can only look. */
export const ReadOnly: Story = {
  args: { onEdit: undefined, onTransfer: undefined, onDelete: undefined },
};

export const Empty: Story = {
  args: { credentials: [] },
};
