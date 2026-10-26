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
  const [hidden, setHidden] = useState<PanelViewId[]>(args.hiddenViews ?? []);
  return (
    <EditorPanel
      {...args}
      view={view}
      onViewChange={setView}
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      maximized={maximized}
      onToggleMaximized={() => setMaximized((m) => !m)}
      hiddenViews={hidden}
      onToggleView={(v) => setHidden((h) => (h.includes(v) ? h.filter((x) => x !== v) : [...h, v]))}
      onResetViews={() => setHidden([])}
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

/** Floating over the canvas. */
export const Floating: Story = {
  args: { floating: true },
  decorators: [
    (Story) => (
      <div className="relative h-[640px] bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px]">
        <div className="absolute inset-x-4 bottom-4">
          <Story />
        </div>
      </div>
    ),
  ],
};

/** Inline under the code, on the Log view. */
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

/** Some views hidden through the ⋯ menu. */
export const ViewsHidden: Story = {
  args: { hiddenViews: ["step", "reference"] },
  decorators: Inline.decorators,
};
