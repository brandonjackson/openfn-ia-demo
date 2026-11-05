import type { Meta, StoryObj } from "@storybook/react";
import AuthProviderForm from "./AuthProviderForm";
import { instanceAuthProvider, instanceUrl } from "../../fixtures/admin";

const meta: Meta<typeof AuthProviderForm> = {
  title: "Domain/AuthProviderForm",
  component: AuthProviderForm,
  parameters: { layout: "padded" },
  args: {
    defaultRedirectHost: instanceUrl,
    onTest: async () => {},
    onSave: async () => {},
    onRemove: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AuthProviderForm>;

/** A provider that's set up: the secret is stored, so it stays blank, and the provider can be removed. */
export const Configured: Story = { args: { provider: instanceAuthProvider } };

/** Setting up a provider for the first time. */
export const New: Story = {};

export const TestPassed: Story = {
  args: {
    provider: instanceAuthProvider,
    test: {
      discoveryUrl: instanceAuthProvider.discoveryUrl,
      ok: true,
      message: "Found the provider's authorization, token and user info endpoints.",
    },
  },
};

export const TestFailed: Story = {
  args: {
    provider: instanceAuthProvider,
    test: {
      discoveryUrl: instanceAuthProvider.discoveryUrl,
      ok: false,
      message: "No OpenID configuration at that URL. Check it's HTTPS and ends in .well-known/openid-configuration.",
    },
  },
};
