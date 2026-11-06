import type { Meta, StoryObj } from "@storybook/react";
import CredentialFormModal from "./CredentialFormModal";
import { userCredentials } from "../../fixtures/user";
import { credentialSchemas } from "../../fixtures/credential-schemas";
import { projectOptions } from "../../fixtures/projects";

/** Fetches a type's fields from the fixtures, as the API would once it's picked. */
const loadSchema = async (id: string) => {
  const schema = credentialSchemas.find((s) => s.id === id);
  if (!schema) throw new Error("Not found");
  return schema;
};

const meta: Meta<typeof CredentialFormModal> = {
  title: "Domain/CredentialFormModal",
  component: CredentialFormModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    schemas: credentialSchemas.map(({ id, name, adaptor }) => ({ id, name, adaptor })),
    onLoadSchema: loadSchema,
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

/** The type's fields on their way from the server. */
export const LoadingFields: Story = {
  args: { initialSchema: "dhis2", onLoadSchema: () => new Promise(() => {}) },
};

/** The server couldn't send the type's fields: its message shows where they'd be. */
export const FieldsRefused: Story = {
  args: {
    initialSchema: "dhis2",
    onLoadSchema: async () => {
      throw new Error("Lightning is still loading the adaptors.");
    },
  },
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
