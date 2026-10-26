import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import AssistantChatInput from "./AssistantChatInput";
import type { AssistantMode } from "../../mock-data/assistant";
import { sampleRun } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof AssistantChatInput>) {
    const [mode, setMode] = useState<AssistantMode>(args.mode ?? "plan");
    return <AssistantChatInput {...args} mode={mode} onModeChange={setMode} />;
}

const meta: Meta<typeof AssistantChatInput> = {
  title: "Workflow/AssistantChatInput",
  component: AssistantChatInput,
  args: { onSend: () => {} },
  decorators: [
    (Story) => (
      <div className="w-[400px] border border-gray-200">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof AssistantChatInput>;

export const Default: Story = {};

/** A run is open, so its logs and data can be attached with the + button. */
export const WithRun: Story = { args: { runId: sampleRun.runId } };

export const BuildMode: Story = { args: { mode: "build" } };

export const Sending: Story = { args: { loading: true } };

/** A step loaded as context from a card's Improve. */
export const WithReference: Story = {
  args: { reference: { kind: "step", id: "search", label: "Search for duplicate citizens in Identity", adaptor: "http" }, onRemoveReference: () => {} },
};
