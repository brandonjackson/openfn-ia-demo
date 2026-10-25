import type { Meta, StoryObj } from "@storybook/react";
import EditorShell from "./EditorShell";
import AIAssistantPanel from "./AIAssistantPanel";
import { assistantConversations } from "../../mock-data/assistant";

const meta: Meta<typeof EditorShell> = {
  title: "Workflow/EditorShell",
  component: EditorShell,
  parameters: { layout: "fullscreen" },
  args: {
    toolbar: <div className="h-[72px] px-4 py-6 text-sm text-gray-500">Toolbar</div>,
    children: <div className="mx-4 mb-4 flex-1 rounded-xl border border-dashed border-gray-300" />,
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EditorShell>;

/** On the canvas, the frame wears the canvas's dotted background. */
export const Canvas: Story = { args: { mode: "canvas" } };

/** In code, a quiet grey. */
export const Code: Story = { args: { mode: "code" } };

/** With the assistant down the right-hand side. */
export const WithAssistant: Story = {
  args: {
    mode: "code",
    assistant: <AIAssistantPanel open appearance="card" conversations={assistantConversations} onClose={() => {}} />,
  },
};
