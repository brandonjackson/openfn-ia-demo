import type { Meta, StoryObj } from "@storybook/react";
import AuthProviderForm from "./AuthProviderForm";
import { authProvider, emptyAuthProvider } from "../../mock-data/admin";

const meta: Meta<typeof AuthProviderForm> = {
  title: "Admin/AuthProviderForm",
  component: AuthProviderForm,
  args: { provider: emptyAuthProvider },
};
export default meta;
type Story = StoryObj<typeof AuthProviderForm>;

export const New: Story = {};
export const Existing: Story = { args: { provider: authProvider ?? emptyAuthProvider } };
export const TestSucceeded: Story = { args: { provider: authProvider ?? emptyAuthProvider, initialTestState: "success" } };
export const TestFailed: Story = { args: { provider: authProvider ?? emptyAuthProvider, initialTestState: "failed" } };
