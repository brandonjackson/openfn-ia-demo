import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { History, Sparkles } from "lucide-react";
import EditorTray from "./EditorTray";
import type { TrayPlacement } from "./EditorTray";
import StatusPill from "./StatusPill";
import LogConsole from "./LogConsole";
import { sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof EditorTray> = {
  title: "Workflow/EditorTray",
  component: EditorTray,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof EditorTray>;

function BottomTray() {
  const [tab, setTab] = useState("log");
  return (
    <div className="relative h-[520px] bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px]">
      <div className="absolute inset-x-4 bottom-4">
        <EditorTray
          title="Map fields"
          badge={<StatusPill status="success" />}
          tabs={{ options: [{ id: "log", label: "Log" }, { id: "input", label: "Input" }, { id: "output", label: "Output" }], value: tab, onChange: setTab }}
          meta={`Run #${sampleRun.runId.slice(0, 4)} · 2.5s`}
          placement="bottom"
          floating
          onMove={() => {}}
          onClose={() => {}}
        >
          <LogConsole lines={sampleRun.logs.slice(0, 8)} />
        </EditorTray>
      </div>
    </div>
  );
}

/** A bottom tray floating over the canvas, as when a step's output is open. */
export const BottomFloating: Story = { render: () => <BottomTray /> };

/** Docked to the right, full height. */
export const Right: Story = {
  render: () => (
    <div className="flex h-[520px] justify-end bg-gray-50">
      <div className="w-[380px]">
        <EditorTray title="Run history" icon={History} placement="right" onMove={() => {}} onClose={() => {}}>
          <p className="p-4 text-sm text-gray-500">Tray content goes here.</p>
        </EditorTray>
      </div>
    </div>
  ),
};

function MovableTray() {
  const [placement, setPlacement] = useState<TrayPlacement>("right");
  const tray = (
    <EditorTray title="Assistant" icon={Sparkles} placement={placement} floating onMove={setPlacement} onClose={() => {}}>
      <p className="p-4 text-sm text-gray-500">Docked {placement}. Use the header control to move it.</p>
    </EditorTray>
  );
  return (
    <div className="relative flex h-[520px] justify-end bg-gray-50">
      {placement === "right" ? <div className="w-[380px]">{tray}</div> : <div className="absolute inset-x-4 bottom-4">{tray}</div>}
    </div>
  );
}

/** The dock control moves a tray between the two placements. */
export const Movable: Story = { render: () => <MovableTray /> };
