import type { Meta, StoryObj } from "@storybook/react";
import TriggerConfigPanel from "./TriggerConfigPanel";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import type { TriggerNode } from "../../model/workflow";
import { projects } from "../../fixtures/projects";

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger") as TriggerNode;
const cron: TriggerNode = { ...trigger, triggerType: "cron", cronExpression: "0 6 * * 1", label: "Cron trigger", subtitle: "Every Monday at 06:00" };
const service = projects.find((p) => p.id === "case-surveillance")!.services[0];
const resolve = () => Promise.resolve();

const meta: Meta<typeof TriggerConfigPanel> = {
  title: "Domain/TriggerConfigPanel",
  component: TriggerConfigPanel,
  decorators: [
    (Story) => (
      <div className="h-[640px] w-80 border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { trigger, url: "https://app.openfn.org/i/8f3c2a1e", onToggleLive: () => {}, onChange: () => {}, workflowName: "National ID check" },
};

export default meta;
type Story = StoryObj<typeof TriggerConfigPanel>;

/** In a sandbox: Change picks a webhook or a schedule; with no listing yet, the workflow can be published from here. */
export const Default: Story = { args: { onPublish: resolve } };
/** A cron trigger: its schedule, as a frequency and the expression, read back in words. */
export const Cron: Story = { args: { trigger: cron } };
/** On main: the type and schedule only read, but the switch still pauses and resumes the workflow. */
export const ReadOnly: Story = { args: { readOnly: true, onChange: undefined } };
/** A cron on main: its schedule reads, with no Change. */
export const CronReadOnly: Story = { args: { trigger: cron, readOnly: true, onChange: undefined } };
/** With nothing to turn it on or off (no `onToggleLive`), the switch only reads. */
export const SwitchReadsOnly: Story = { args: { readOnly: true, onChange: undefined, onToggleLive: undefined } };
export const Paused: Story = { args: { live: false } };

/** Published as a service, for an owner or admin: the listing with Edit listing, and the schema and response its docs come from. */
export const PublishedAsService: Story = { args: { service, onEditListing: resolve } };
/** Published, for an editor or viewer: the listing only reads. */
export const PublishedReadOnly: Story = { args: { service } };

/** Without the service catalog: a webhook carries no service listing. */
export const WithoutServiceAnnotations: Story = { args: { showServiceAnnotations: false } };
