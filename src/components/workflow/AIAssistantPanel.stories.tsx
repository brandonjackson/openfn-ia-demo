import type { Meta, StoryObj } from "@storybook/react";
import AIAssistantPanel from "./AIAssistantPanel";
import { assistantConversations } from "../../mock-data/assistant";
import { sampleRun } from "../../mock-data/runs";

const duplicates = assistantConversations[0];

const meta: Meta<typeof AIAssistantPanel> = {
  title: "Workflow/AIAssistantPanel",
  component: AIAssistantPanel,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    conversations: assistantConversations,
    onClose: () => {},
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen justify-end bg-gray-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AIAssistantPanel>;

/** Opens on the workflow's saved conversations; typing starts a new one. */
export const Conversations: Story = {};

/** No conversations yet: suggested first questions. */
export const Empty: Story = { args: { conversations: [] } };

/** A conversation about one job, with suggested code. */
export const Chat: Story = {
  args: { jobLabel: duplicates.jobLabel, defaultConversationId: duplicates.id },
};

/** With a run selected, its logs and data can be attached to a message. */
export const WithRunSelected: Story = {
  args: { jobLabel: duplicates.jobLabel, defaultConversationId: duplicates.id, runId: sampleRun.runId },
};

export const MenuOpen: Story = { args: { defaultMenuOpen: true } };

export const About: Story = { args: { defaultAboutOpen: true } };
