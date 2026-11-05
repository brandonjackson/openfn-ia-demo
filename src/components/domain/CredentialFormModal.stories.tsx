import type { Meta, StoryObj } from "@storybook/react";
import CredentialFormModal from "./CredentialFormModal";
import { userCredentials } from "../../fixtures/user";
import { credentialSchemas } from "../../fixtures/credential-schemas";
import { projectOptions } from "../../fixtures/projects";

const meta: Meta<typeof CredentialFormModal> = {
  title: "Domain/CredentialFormModal",
  component: CredentialFormModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    schemas: credentialSchemas,
    projects: projectOptions,
    onSave: async () => {},
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CredentialFormModal>;

/** A new credential starts by picking its type. */
export const PickType: Story = {};

/** A new DHIS2 credential: its schema's fields for production, with nothing shared yet. */
export const NewDhis2: Story = {
  args: { initialSchema: "dhis2" },
};

/** Raw JSON takes any body, as long as it's a JSON object. */
export const NewRawJson: Story = {
  args: { initialSchema: "raw" },
};

/** Editing a credential with production and staging values. Its secrets show as saved, not their values. */
export const Edit: Story = {
  args: { credential: userCredentials.find((c) => c.id === "ucred-lab-api") },
};

/** The server said no: its message shows above the form. */
export const ServerError: Story = {
  args: {
    credential: userCredentials[0],
    onSave: async () => {
      throw new Error("another credential with the same external ID already exists in this project");
    },
  },
};
