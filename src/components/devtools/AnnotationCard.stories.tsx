import type { Meta, StoryObj } from "@storybook/react";
import AnnotationCard from "./AnnotationCard";
import type { Annotation } from "../../annotations/source";

const sample: Annotation = {
  id: "project-settings-collaborators",
  folder: "views",
  url: "https://github.com/OpenFn/lightning/blob/claude/tender-mendel-0pejfc/annotations/views/project-settings-collaborators.md",
  frontMatterRaw: "id: project-settings-collaborators\ntype: view\nstatus: in-progress\ninherits:\n  - shared-project-scope",
  frontMatter: {
    id: "project-settings-collaborators",
    type: "view",
    title: "Project settings › Collaborators",
    status: "in-progress",
    inherits: ["shared-project-scope", "shared-usage-limits-banner"],
    flows: ["flow-invite-collaborator"],
  },
  body: "## 1. Purpose\n\nOwners and admins decide **who can work on a project** and what they can do.\n\n## 2. What it does\n\n- Lists collaborators with their role\n- Adds existing users, invites new ones by email\n- `Remove Collaborator` asks for confirmation\n",
};

const meta: Meta<typeof AnnotationCard> = {
  title: "Devtools/AnnotationCard",
  component: AnnotationCard,
  args: { id: sample.id, annotation: sample },
  decorators: [(Story) => <div className="w-[400px] p-5 bg-white">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof AnnotationCard>;

export const Written: Story = {
  args: { inventory: { id: sample.id, section: "Project settings", route: "#collaboration", status: "batch-2" } },
};
export const NotWrittenYet: Story = {
  args: {
    id: "history-work-orders",
    annotation: null,
    inventory: { id: "history-work-orders", section: "History and runs", route: "live /projects/:project_id/history", status: "todo" },
    inventoryHref: "#",
  },
};
