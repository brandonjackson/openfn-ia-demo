import type { Meta, StoryObj } from "@storybook/react";
import AssistantResultCard from "./AssistantResultCard";
import { assistantConversations } from "../../fixtures/assistant";

const result = assistantConversations[0].messages[2].result!;

const meta: Meta<typeof AssistantResultCard> = {
  title: "Domain/AssistantResultCard",
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

/** Test cases the assistant wrote from the spec: a line for each, and "Open test cases" instead of the runs. */
export const TestsWritten: Story = {
  args: {
    onOpenTests: () => {},
    result: {
      about: "tests",
      items: [
        { label: "Logs never pair a name with a date of birth", outcome: "ok" },
        { label: "Identity is down: application is queued", outcome: "ok" },
      ],
    },
  },
};
