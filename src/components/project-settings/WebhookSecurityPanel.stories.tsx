import type { Meta, StoryObj } from "@storybook/react";
import WebhookSecurityPanel from "./WebhookSecurityPanel";
import { webhookAuthMethods } from "../../mock-data/project-settings";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof WebhookSecurityPanel> = {
  title: "Project settings/WebhookSecurityPanel",
  component: WebhookSecurityPanel,
  decorators: [withRouter, (Story) => <div className="space-y-4 bg-gray-100 p-6"><Story /></div>],
  args: { projectId: projects[0].id, initialAuthMethods: webhookAuthMethods, canWrite: true },
};
export default meta;
type Story = StoryObj<typeof WebhookSecurityPanel>;

export const WithMethods: Story = {};
export const Empty: Story = { args: { initialAuthMethods: [] } };
export const Sandbox: Story = { args: { parentProject: projects[0] } };
