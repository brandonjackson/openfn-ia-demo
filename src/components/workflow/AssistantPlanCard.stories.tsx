import type { Meta, StoryObj } from "@storybook/react";
import AssistantPlanCard from "./AssistantPlanCard";
import { assistantConversations } from "../../mock-data/assistant";

const plan = assistantConversations[0].messages[1].plan!;

const meta: Meta<typeof AssistantPlanCard> = {
  title: "Workflow/AssistantPlanCard",
  component: AssistantPlanCard,
  decorators: [
    (Story) => (
      <div className="w-80 bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
  args: { plan: { ...plan, status: undefined }, onAccept: () => {}, onEdit: () => {} },
};

export default meta;
type Story = StoryObj<typeof AssistantPlanCard>;

export const Proposed: Story = {};
export const Accepted: Story = { args: { plan } };
export const Declined: Story = { args: { plan: { ...plan, status: "declined" } } };
