import type { Meta, StoryObj } from "@storybook/react";
import WebhookAuthMethodsTable from "./WebhookAuthMethodsTable";
import { webhookAuthMethods } from "../../mock-data/project-settings";

const noop = () => {};
const meta: Meta<typeof WebhookAuthMethodsTable> = {
  title: "Project settings/WebhookAuthMethodsTable",
  component: WebhookAuthMethodsTable,
  args: {
    authMethods: webhookAuthMethods,
    canWrite: true,
    onCreate: noop,
    onView: noop,
    onDelete: noop,
    onShowUsage: noop,
  },
};
export default meta;
type Story = StoryObj<typeof WebhookAuthMethodsTable>;

export const Default: Story = {};
export const Empty: Story = { args: { authMethods: [] } };
export const ReadOnly: Story = { args: { canWrite: false } };
