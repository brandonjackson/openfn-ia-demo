import type { Meta, StoryObj } from "@storybook/react";
import SuggestedServiceCard from "./SuggestedServiceCard";
import { overviewData } from "../mock-data/overview";
import { connectedSystemSummaries } from "../mock-data/connected-systems";

const meta: Meta<typeof SuggestedServiceCard> = {
  title: "Components/SuggestedServiceCard",
  component: SuggestedServiceCard,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SuggestedServiceCard>;

export const Default: Story = {
  args: {
    service: overviewData.suggestedServices[0],
    systems: connectedSystemSummaries,
  },
};

export const UnknownSystems: Story = {
  name: "Systems not yet connected (grey pills)",
  args: {
    service: overviewData.suggestedServices[0],
    systems: [],
  },
};
