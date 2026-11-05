import type { Meta, StoryObj } from "@storybook/react";
import WebhookAuthMethodTable from "./WebhookAuthMethodTable";
import { projects } from "../../fixtures/projects";
import { projectWebhookAuthMethods, webhookTriggers } from "../../fixtures/project-settings";

const [projectA] = projects;

const meta: Meta<typeof WebhookAuthMethodTable> = {
  title: "Domain/WebhookAuthMethodTable",
  component: WebhookAuthMethodTable,
  parameters: { layout: "padded" },
  args: {
    methods: projectWebhookAuthMethods(projectA.id),
    triggers: webhookTriggers(projectA),
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof WebhookAuthMethodTable>;

export const Default: Story = {};

/** Without permission to write auth methods there's nothing to click. */
export const ReadOnly: Story = { args: { onEdit: undefined, onDelete: undefined, onCreate: undefined } };

export const Empty: Story = { args: { methods: [] } };
