import type { Meta, StoryObj } from "@storybook/react";
import AssistantResultCard from "./AssistantResultCard";
import { assistantConversations } from "../../mock-data/assistant";

const result = assistantConversations[0].messages[2].result!;

const meta: Meta<typeof AssistantResultCard> = {
  title: "Workflow/AssistantResultCard",
  component: AssistantResultCard,
  decorators: [
    (Story) => (
      <div className="w-80 bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
  args: { result, onOpenRuns: () => {}, onAskToMerge: () => {} },
};

export default meta;
type Story = StoryObj<typeof AssistantResultCard>;

export const Default: Story = {};
export const OnMain: Story = { args: { onAskToMerge: undefined } };
export const WithFailure: Story = {
  args: { result: { items: [{ label: "2 saved", outcome: "ok" }, { label: "1 failed", outcome: "failed" }] } },
};
