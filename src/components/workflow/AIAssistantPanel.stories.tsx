import type { Meta, StoryObj } from "@storybook/react";
import { aiSessionsFor } from "../../mock-data/ai-assistant";
import AIAssistantPanel from "./AIAssistantPanel";
import { withSidePanel } from "../../stories/decorators";

const meta: Meta<typeof AIAssistantPanel> = {
  title: "Workflow/AIAssistantPanel",
  component: AIAssistantPanel,
  parameters: { layout: "fullscreen" },
  decorators: [withSidePanel("h-190")],
  args: { sessions: aiSessionsFor("wf-openhie"), onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof AIAssistantPanel>;

export const Conversations: Story = {};
export const NoConversations: Story = { args: { sessions: [] } };
