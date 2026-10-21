import type { Meta, StoryObj } from "@storybook/react";
import AssistantChatInput from "./AssistantChatInput";
import { sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof AssistantChatInput> = {
  title: "Workflow/AssistantChatInput",
  component: AssistantChatInput,
  args: { onSend: () => {}, placeholder: "Ask me anything about this workflow..." },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AssistantChatInput>;

export const Default: Story = {};

/** A run is open, so its logs and data can be attached. */
export const WithRun: Story = { args: { runId: sampleRun.runId } };

export const Sending: Story = { args: { loading: true } };
