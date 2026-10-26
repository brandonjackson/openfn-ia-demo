import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DataSnippet from "./DataSnippet";
import { dataclips, sampleRun } from "../../mock-data/runs";

const stepLogs = sampleRun.logs.filter((l) => l.stepId === sampleRun.steps[0].id);
const input = dataclips.find((d) => d.id === sampleRun.inputId)!;

/** Expands and collapses on its own, growing its frame to 80 columns when expanded. */
function Stateful(args: ComponentProps<typeof DataSnippet>) {
  const [expanded, setExpanded] = useState(args.expanded ?? false);
  return (
    <div
      className={`flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-xl transition-[width] ${
        expanded ? "h-[480px] w-[720px]" : "w-[380px]"
      }`}
    >
      <DataSnippet {...args} expanded={expanded} onExpand={() => setExpanded(true)} onCollapse={() => setExpanded(false)} />
    </div>
  );
}

const meta: Meta<typeof DataSnippet> = {
  title: "Workflow/DataSnippet",
  component: DataSnippet,
  args: {
    title: "Input",
    lines: input.body.split("\n"),
    meta: input.name,
  },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof DataSnippet>;

/** A snippet of the step's input: the first lines, cut at the edge, and how many more there are. */
export const Default: Story = {};

/** The step's log, dark, with each line's source as a tag. */
export const Log: Story = {
  args: {
    title: "Log",
    lines: stepLogs.map((l) => l.message),
    tags: stepLogs.map((l) => l.source),
    tone: "dark",
    meta: `${stepLogs.length} lines`,
  },
};

/** Expanded: every line in full, at 80 columns. */
export const Expanded: Story = {
  args: { expanded: true },
};

/** Nothing to show. */
export const Empty: Story = {
  args: { title: "Output", lines: [], meta: undefined, empty: "This step hasn't finished yet." },
};

/** Folded to its header while another section has the room. */
export const Folded: Story = {
  args: { folded: true },
};
