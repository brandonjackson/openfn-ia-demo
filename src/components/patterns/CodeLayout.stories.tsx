import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, MoreHorizontal, Workflow } from "lucide-react";
import CodeLayout from "./CodeLayout";
import EditorTray from "./EditorTray";
import EditorPanel from "./EditorPanel";
import NavItem from "../primitives/NavItem";
import IconButton from "../primitives/IconButton";
import CodeEditor from "../primitives/CodeEditor";
import CodePaneHeader from "../domain/CodePaneHeader";
import EditorStatusBar from "../domain/EditorStatusBar";
import LogConsole from "../domain/LogConsole";
import { panelViews } from "../domain/panel-views";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import { sampleRun } from "../../fixtures/runs";

const step = nationalIdWorkflow.nodes.find((n) => n.type === "job");
const code = step && step.type === "job" ? step.body : "";

const meta: Meta<typeof CodeLayout> = {
  title: "Patterns/CodeLayout",
  component: CodeLayout,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-screen bg-gray-50">
        <Story />
      </div>
    ),
  ],
  args: {
    nav: (
      <div className="space-y-0.5 p-3">
        <NavItem variant="tree" icon={Workflow} label="workflow.yaml" onClick={() => {}} />
        <NavItem variant="tree" icon={FileText} label="context.md" active onClick={() => {}} />
      </div>
    ),
    header: <CodePaneHeader path={["National ID", "context.md"]} />,
    children: <CodeEditor code={code} />,
    footer: <EditorStatusBar items={["context.md"]} trailing={["12 lines", "Saved"]} />,
  },
};

export default meta;
type Story = StoryObj<typeof CodeLayout>;

/** Nav, the main content under its header, and a footer: no trays. */
export const Default: Story = {};

function DetailsTray() {
  const [tab, setTab] = useState("config");
  return (
    <EditorTray
      placement="right"
      tabs={{ options: [{ id: "config", label: "Config" }, { id: "snippets", label: "Snippets" }], value: tab, onChange: setTab }}
      actions={<IconButton icon={MoreHorizontal} label="Layout" onClick={() => {}} />}
    >
      <p className="p-4 text-sm text-gray-500">{tab} view</p>
    </EditorTray>
  );
}

function BottomPanel() {
  const [view, setView] = useState<string>("log");
  return (
    <EditorPanel views={panelViews} view={view} onViewChange={setView} onClose={() => {}}>
      <LogConsole lines={sampleRun.logs.slice(0, 8)} />
    </EditorPanel>
  );
}

/** Both trays: the details column on the right, and the panel under the code. */
export const WithTrays: Story = {
  args: { rightTray: <DetailsTray />, bottomTray: <BottomPanel /> },
};

/** Without its nav column, as when the explorer is hidden. */
export const NoNav: Story = {
  args: { nav: undefined, rightTray: <DetailsTray /> },
};
