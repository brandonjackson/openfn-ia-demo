import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditorPanel from "./EditorPanel";
import LogConsole from "./LogConsole";
import RunHistoryList from "./RunHistoryList";
import StatusPill from "./StatusPill";
import type { PanelViewId } from "../../editor-layout";
import { sampleRun, workOrders } from "../../mock-data/runs";

function Stateful(args: ComponentProps<typeof EditorPanel>) {
  const [view, setView] = useState<PanelViewId>(args.view);
  const [collapsed, setCollapsed] = useState(args.collapsed ?? false);
  const [maximized, setMaximized] = useState(args.maximized ?? false);
  return (
    <EditorPanel
      {...args}
      view={view}
      onViewChange={setView}
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      maximized={maximized}
      onToggleMaximized={() => setMaximized((m) => !m)}
      hiddenViews={args.hiddenViews}
      onClose={() => {}}
    >
      {view === "runs" ? (
        <RunHistoryList workOrders={workOrders} selectedRunId={sampleRun.runId} latestVersion="v2" />
      ) : view === "log" ? (
        <LogConsole lines={sampleRun.logs.slice(0, 10)} />
      ) : (
        <p className="p-4 text-sm text-gray-500">{view} view</p>
      )}
    </EditorPanel>
  );
}

const meta: Meta<typeof EditorPanel> = {
  title: "Workflow/EditorPanel",
  component: EditorPanel,
  parameters: { layout: "fullscreen" },
  args: {
    view: "runs",
    context: (
      <>
        <StatusPill status="success" variant="dot" />
        Run <code className="font-mono">afa317</code> · 3 s
      </>
    ),
  },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof EditorPanel>;

/** Under the code, on the Log view. */
export const Inline: Story = {
  args: { view: "log" },
  decorators: [
    (Story) => (
      <div className="flex h-[480px] flex-col justify-end border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

/** Collapsed to its tab bar, with no run loaded so the run views are disabled. */
export const Collapsed: Story = {
  args: { collapsed: true, disabledViews: ["log", "input", "output"], context: "No run loaded" },
  decorators: Inline.decorators,
};

/** Some views hidden through the layout menu. */
export const ViewsHidden: Story = {
  args: { hiddenViews: ["failures", "input"] },
  decorators: Inline.decorators,
};
