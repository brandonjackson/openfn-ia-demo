import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditorExplorer from "./EditorExplorer";
import type { ExplorerFile } from "./EditorExplorer";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import { failedRun } from "../../fixtures/runs";
import { projects } from "../../fixtures/projects";
import { connectedSystems } from "../../fixtures/connected-systems";

const components = projects[0].components.filter((c) => c.type !== "Workflow");

function Stateful(args: ComponentProps<typeof EditorExplorer>) {
  const [file, setFile] = useState<ExplorerFile>(args.file);
  return <EditorExplorer {...args} file={file} onOpen={setFile} />;
}

const meta: Meta<typeof EditorExplorer> = {
  title: "Domain/EditorExplorer",
  component: EditorExplorer,
  decorators: [
    (Story) => (
      <div className="h-[480px] w-72 border-r border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { workflow: nationalIdWorkflow, systems: connectedSystems, file: { stepId: "search" }, components },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof EditorExplorer>;

/** On main: read-only, so each + beside the group headings is disabled. */
export const ReadOnly: Story = { args: { readOnly: true } };

/** In a sandbox, each group adds from the + beside its heading. */
export const Editable: Story = {
  args: { onAddFile: () => {}, onAddStep: () => {}, onAddComponent: () => {} },
};

/** A doc added this session, open. */
export const AddedDoc: Story = {
  args: { docs: ["untitled.md"], file: { docName: "untitled.md" }, onAddFile: () => {}, onAddStep: () => {}, onAddComponent: () => {} },
};

/** A workflow behind a published service lists its listing after the context and spec. */
export const ServiceListing: Story = { args: { hasService: true, file: "service" } };

/** The project's saved dataclips, listed under the docs with how many there are. */
export const SavedDataclipsOpen: Story = {
  args: { files: ["context", "spec", "dataclips"], savedDataclipCount: 2, file: "dataclips", onAddFile: () => {}, onAddStep: () => {} },
};

/** The workflow's test cases, under Saved dataclips, saying how many failed last time. */
export const TestCasesOpen: Story = {
  args: { files: ["context", "spec", "dataclips"], savedDataclipCount: 2, testSummary: { total: 4, failed: 1 }, file: "testCases", onAddFile: () => {}, onAddStep: () => {} },
};

/** A new workflow with none of its optional files yet: the + adds them. */
export const OnlyTheWorkflow: Story = { args: { files: [], file: "workflow", onAddFile: () => {}, onAddStep: () => {} } };

/** Health open: it sits under service.yaml and opens a page rather than a file. */
export const HealthOpen: Story = { args: { hasService: true, file: "health" } };

/** With a run selected, each step shows how it went. */
export const FollowingRun: Story = { args: { run: failedRun, file: { stepId: "create" } } };

export const ComponentOpen: Story = { args: { file: { componentId: components[0].id } } };

/** A workflow in a project with no other components, on main: the group stays with a disabled +. */
export const NoComponents: Story = { args: { components: [], readOnly: true } };

/** With no components yet, a sandbox still shows the group so one can be added. */
export const NoComponentsEditable: Story = { args: { components: [], onAddStep: () => {}, onAddComponent: () => {} } };

/** With the Workflow docs and Components flags off: just the trigger and steps. */
export const StepsOnly: Story = { args: { showWorkflowFiles: false, showComponents: false, onAddStep: () => {} } };

/** Without connected systems: steps show only their adaptor's logo and name. */
export const WithoutSystems: Story = { args: { systems: [] } };
