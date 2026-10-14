import type { Meta, StoryObj } from "@storybook/react";
import { aiSessionsFor } from "../../mock-data/ai-assistant";
import AIAssistantPanel from "./AIAssistantPanel";

const meta: Meta<typeof AIAssistantPanel> = {
  title: "Workflow/AIAssistantPanel",
  component: AIAssistantPanel,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="h-[760px] flex justify-end"><Story /></div>],
  args: { sessions: aiSessionsFor("wf-openhie"), onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof AIAssistantPanel>;

export const Conversations: Story = {};
export const NoConversations: Story = { args: { sessions: [] } };
