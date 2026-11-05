import type { Meta, StoryObj } from "@storybook/react";
import WebhookAuthMethodModal from "./WebhookAuthMethodModal";
import { projects } from "../../fixtures/projects";
import { projectWebhookAuthMethods, webhookTriggers } from "../../fixtures/project-settings";

const [projectA] = projects;
const methods = projectWebhookAuthMethods(projectA.id);

const meta: Meta<typeof WebhookAuthMethodModal> = {
  title: "Domain/WebhookAuthMethodModal",
  component: WebhookAuthMethodModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    triggers: webhookTriggers(projectA),
    takenNames: methods.map((m) => m.name),
    onClose: () => {},
    onCreate: async ({ type }) => ({ secret: type === "api" ? "5f0c2e9a7b14d36e8c01a2f4b9d7e6c3" : undefined }),
    onUpdate: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof WebhookAuthMethodModal>;

/** A new method starts with a choice of basic auth or an API key. */
export const New: Story = {};

export const EditApiKey: Story = {
  args: { method: methods[0], takenNames: methods.slice(1).map((m) => m.name) },
};

export const EditBasicAuth: Story = {
  args: { method: methods[1], takenNames: [methods[0].name] },
};
