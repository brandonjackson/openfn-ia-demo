import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel";
import EditorTray from "./EditorTray";
import { assistantConversations } from "../../mock-data/assistant";
import { sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof AIAssistantPanel> = {
  title: "Workflow/AIAssistantPanel",
  component: AIAssistantPanel,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex h-screen justify-end bg-gray-50">
        <div className="w-[400px]">
          <EditorTray title="Assistant" icon={Sparkles} placement="right" onClose={() => {}} onMove={() => {}}>
            <Story />
          </EditorTray>
        </div>
      </div>
    ),
  ],
  args: { conversations: assistantConversations, onOpenRuns: () => {}, onAskToMerge: () => {} },
};

export default meta;
type Story = StoryObj<typeof AIAssistantPanel>;

/** Opens on the workflow's saved conversations. */
export const Conversations: Story = {};

/** A plan the assistant proposed and carried out, with the result. */
export const PlanAndResult: Story = {
  args: { defaultConversationId: "conv-consent", jobLabel: "Create new citizen in Identity" },
};

/** With a step open and no conversations about it yet, suggestions are offered. */
export const NewStepConversation: Story = {
  args: { jobLabel: "Queue application for retry", runId: sampleRun.runId },
};

export const About: Story = { args: { defaultAboutOpen: true } };

/** Opened from a card's Improve: the step is loaded into the chat input. */
export const ImproveStep: Story = {
  args: {
    jobLabel: "Search for duplicate citizens in Identity",
    reference: { kind: "step", id: "search", label: "Search for duplicate citizens in Identity", adaptor: "http" },
    onClearReference: () => {},
  },
};
