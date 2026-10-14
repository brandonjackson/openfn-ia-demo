import type { Meta, StoryObj } from "@storybook/react";
import NewCredentialMenuButton from "./NewCredentialMenuButton";
import { projectCredentialMenuOptions } from "./credentialModalEvents";

const meta: Meta<typeof NewCredentialMenuButton> = {
  title: "Credentials/NewCredentialMenuButton",
  component: NewCredentialMenuButton,
  decorators: [(Story) => <div className="flex justify-end p-4 pb-40 w-96"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof NewCredentialMenuButton>;

export const UserCredentials: Story = {};
export const ProjectSettings: Story = { args: { options: projectCredentialMenuOptions(true, true) } };
export const EditorCannotCreateKeychain: Story = { args: { options: projectCredentialMenuOptions(true, false) } };
