import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MoreHorizontal } from "lucide-react";
import EditorTray from "./EditorTray";
import IconButton from "../primitives/IconButton";
import StatusPill from "../domain/StatusPill";
import LogConsole from "../domain/LogConsole";
import { sampleRun } from "../../fixtures/runs";

const meta: Meta<typeof EditorTray> = {
  title: "Patterns/EditorTray",
  component: EditorTray,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof EditorTray>;

function RightTray() {
  const [tab, setTab] = useState("config");
  return (
    <div className="flex h-[520px] justify-end border border-gray-200 bg-white">
      <EditorTray
        placement="right"
        tabs={{ options: [{ id: "config", label: "Config" }, { id: "snippets", label: "Snippets" }], value: tab, onChange: setTab }}
        actions={<IconButton icon={MoreHorizontal} label="Layout" onClick={() => {}} />}
        onClose={() => {}}
      >
        <p className="p-4 text-sm text-gray-500">{tab} view</p>
      </EditorTray>
    </div>
  );
}

/** The details column beside the code: tabs for its views, and the corner controls. */
export const Right: Story = { render: () => <RightTray /> };

function BottomTray() {
  const [tab, setTab] = useState("log");
  return (
    <div className="flex h-[520px] flex-col justify-end border border-gray-200 bg-white">
      <EditorTray
        placement="bottom"
        tabs={{ options: [{ id: "log", label: "Log" }, { id: "input", label: "Input" }, { id: "output", label: "Output" }], value: tab, onChange: setTab }}
        meta={
          <>
            <StatusPill status="success" variant="dot" />
            Run {sampleRun.runId.slice(0, 6)} · 2.5 s
          </>
        }
        onClose={() => {}}
      >
        <LogConsole lines={sampleRun.logs.slice(0, 8)} />
      </EditorTray>
    </div>
  );
}

/** The panel under the code, with context about the open view at the right. */
export const Bottom: Story = { render: () => <BottomTray /> };

/** A tray can carry a name and a status ahead of its tabs. */
export const WithTitle: Story = {
  render: () => (
    <div className="flex h-[320px] flex-col justify-end border border-gray-200 bg-white">
      <EditorTray placement="bottom" title="Map fields" badge={<StatusPill status="success" />} onClose={() => {}} heightClass="h-40">
        <LogConsole lines={sampleRun.logs.slice(0, 4)} />
      </EditorTray>
    </div>
  ),
};
