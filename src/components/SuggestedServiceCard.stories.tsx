import type { Meta, StoryObj } from "@storybook/react";
import SuggestedServiceCard from "./SuggestedServiceCard";
import { suggestedServices } from "../mock-data/overview";

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
  args: { service: suggestedServices[0] },
};

export const Reporting: Story = {
  args: { service: suggestedServices[3] },
};
