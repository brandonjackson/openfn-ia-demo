import type { Meta, StoryObj } from "@storybook/react";
import AddComponentPanel from "./AddComponentPanel";
import { BookOpen, Database, FilePlus, FileText } from "lucide-react";
import { componentTypes } from "../../model/component-types";

const meta: Meta<typeof AddComponentPanel> = {
  title: "Domain/AddComponentPanel",
  component: AddComponentPanel,
  decorators: [
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AddComponentPanel>;

/** As shown on a project's Components page: every type except workflows. */
export const Default: Story = {
  args: { options: componentTypes.filter((t) => t.type !== "Workflow") },
};

export const AllTypes: Story = {
  args: { options: componentTypes },
};

/** Inside a dialog, as the workflow editor's explorer opens it. */
export const InDialog: Story = {
  args: { options: componentTypes.filter((t) => t.type !== "Workflow"), columns: 2, bare: true },
  decorators: [
    (Story) => (
      <div className="max-w-2xl rounded-xl border border-gray-200 p-5">
        <Story />
      </div>
    ),
  ],
};

/** The workflow editor's "Add to workflow": the workflow's own files, with a tag on what it already has. */
export const WorkflowFiles: Story = {
  args: {
    columns: 2,
    bare: true,
    options: [
      { type: "Service manifest", icon: BookOpen, description: "service.md: how other teams call the workflow as a service, and what it returns." },
      { type: "Spec", icon: FileText, tag: "Added", description: "spec.md: what goes in, what each step writes, and when a run counts as done." },
      { type: "Saved dataclip", icon: Database, tag: "2 saved", description: "An input kept in the project to run the workflow with again." },
      { type: "Context", icon: FileText, tag: "Added", description: "context.md: the legislation and people behind the workflow, for the assistant to read." },
      { type: "Doc", icon: FilePlus, description: "A blank Markdown doc kept alongside the workflow." },
    ],
  },
  decorators: InDialog.decorators,
};
