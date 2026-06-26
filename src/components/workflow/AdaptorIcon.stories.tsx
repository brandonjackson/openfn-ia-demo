import type { Meta, StoryObj } from "@storybook/react";
import { AdaptorIcon, TriggerIcon } from "./AdaptorIcon";

const meta: Meta<typeof AdaptorIcon> = {
  title: "Workflow/AdaptorIcon",
  component: AdaptorIcon,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof AdaptorIcon>;

export const Http: Story = { args: { adaptor: "http", size: "md" } };
export const Common: Story = { args: { adaptor: "common", size: "md" } };

export const AllAdaptors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AdaptorIcon adaptor="http" />
      <AdaptorIcon adaptor="common" />
      <AdaptorIcon adaptor="dhis2" />
      <AdaptorIcon adaptor="salesforce" />
      <AdaptorIcon adaptor="postgresql" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AdaptorIcon adaptor="http" size="sm" />
      <AdaptorIcon adaptor="http" size="md" />
      <AdaptorIcon adaptor="http" size="lg" />
    </div>
  ),
};

export const Triggers: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <TriggerIcon triggerType="webhook" size="lg" />
      <TriggerIcon triggerType="cron" size="lg" />
      <TriggerIcon triggerType="kafka" size="lg" />
    </div>
  ),
};
