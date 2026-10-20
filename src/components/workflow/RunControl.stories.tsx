import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RunControl from "./RunControl";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import { serviceForWorkflow } from "../../mock-data/projects";

const retryStep = nationalIdWorkflow.nodes[1].label;
const service = serviceForWorkflow("planning-application-workflow");

/** Keeps the live state so "Go live" and "Disable" respond. */
function ControlledRunControl(args: ComponentProps<typeof RunControl>) {
  const [live, setLive] = useState(args.live);
  return <RunControl {...args} live={live} onToggleLive={setLive} />;
}

const meta: Meta<typeof RunControl> = {
  title: "Workflow/RunControl",
  component: RunControl,
  args: { live: true, url: service?.url, onSeeDetails: () => {} },
  decorators: [
    (Story) => (
      <div className="flex h-64 items-start justify-end p-4">
        <Story />
      </div>
    ),
  ],
  render: (args) => <ControlledRunControl {...args} />,
};

export default meta;
type Story = StoryObj<typeof RunControl>;

export const Live: Story = {};

export const Disabled: Story = { args: { live: false } };

/** Without a published service there is no URL to copy or listing to open. */
export const NoService: Story = { args: { url: undefined, onSeeDetails: undefined, defaultOpen: true } };

export const LiveMenuOpen: Story = { args: { defaultOpen: true } };

export const DisabledMenuOpen: Story = { args: { live: false, defaultOpen: true } };

/** A step from an earlier run is open: the inset button retries from it. */
export const Retry: Story = { args: { retryStep } };

export const RetryMenuOpen: Story = { args: { retryStep, defaultOpen: true } };
