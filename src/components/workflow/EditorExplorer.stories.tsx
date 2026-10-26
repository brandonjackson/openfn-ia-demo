import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditorExplorer from "./EditorExplorer";
import type { ExplorerFile } from "./EditorExplorer";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import { failedRun } from "../../mock-data/runs";
import { projects } from "../../mock-data/projects";

const components = projects[0].components.filter((c) => c.type !== "Workflow");

function Stateful(args: ComponentProps<typeof EditorExplorer>) {
    const [file, setFile] = useState<ExplorerFile>(args.file);
    return <EditorExplorer {...args} file={file} onOpen={setFile} />;
}

const meta: Meta<typeof EditorExplorer> = {
  title: "Workflow/EditorExplorer",
  component: EditorExplorer,
  decorators: [
    (Story) => (
      <div className="h-[480px] w-72 border-r border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { workflow: nationalIdWorkflow, file: { stepId: "search" }, components },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof EditorExplorer>;

/** On main: read-only, so no "Add step". */
export const ReadOnly: Story = {};

export const Editable: Story = { args: { onAddStep: () => {} } };

/** With a run selected, each step shows how it went. */
export const FollowingRun: Story = { args: { run: failedRun, file: { stepId: "create" } } };

export const ComponentOpen: Story = { args: { file: { componentId: components[0].id } } };

/** A workflow in a project with no other components. */
export const NoComponents: Story = { args: { components: [] } };
