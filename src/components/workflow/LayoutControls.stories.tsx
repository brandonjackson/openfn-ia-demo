import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import LayoutControls from "./LayoutControls";

function Stateful(args: ComponentProps<typeof LayoutControls>) {
  const [explorer, setExplorer] = useState(args.explorerOpen ?? true);
  const [panel, setPanel] = useState(args.panelOpen);
  const [assistant, setAssistant] = useState(args.assistantOpen);
  return (
    <LayoutControls
      explorerOpen={args.onToggleExplorer ? explorer : undefined}
      onToggleExplorer={args.onToggleExplorer ? () => setExplorer((e) => !e) : undefined}
      panelOpen={panel}
      onTogglePanel={() => setPanel((p) => !p)}
      assistantOpen={args.onToggleAssistant ? assistant : undefined}
      onToggleAssistant={args.onToggleAssistant ? () => setAssistant((a) => !a) : undefined}
    />
  );
}

const meta: Meta<typeof LayoutControls> = {
  title: "Workflow/LayoutControls",
  component: LayoutControls,
  args: { panelOpen: true, onTogglePanel: () => {} },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof LayoutControls>;

/** On the canvas there's no explorer to toggle. */
export const Canvas: Story = {};

/** In code mode the explorer toggle joins the others. */
export const Code: Story = { args: { explorerOpen: true, onToggleExplorer: () => {} } };

/** With the assistant toggle included, when it isn't placed apart. */
export const WithAssistant: Story = { args: { assistantOpen: false, onToggleAssistant: () => {} } };
