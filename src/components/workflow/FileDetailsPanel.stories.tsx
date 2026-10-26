import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Database, ExternalLink, FolderKanban, User } from "lucide-react";
import FileDetailsPanel from "./FileDetailsPanel";
import Badge from "../Badge";
import Button from "../Button";

const meta: Meta<typeof FileDetailsPanel> = {
  title: "Workflow/FileDetailsPanel",
  component: FileDetailsPanel,
  decorators: [
    (Story) => (
      <div className="h-[420px] w-80 border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FileDetailsPanel>;

export const Document: Story = {
  args: {
    title: "context.md",
    description: "The legislation behind the workflow and the groups of citizens it affects. The assistant reads it before proposing changes.",
    properties: [
      { icon: User, label: "Last edited by", value: "Brandon Jackson" },
      { icon: Calendar, label: "Updated", value: "14 Oct 2026" },
    ],
  },
};

export const Component: Story = {
  args: {
    title: "planning-authority-codes",
    tag: <Badge label="Collection" />,
    description: "Lookup table of planning authority codes and jurisdictions.",
    properties: [
      { icon: Database, label: "Type", value: "Collection" },
      { icon: FolderKanban, label: "Project", value: "Project A" },
      { icon: Database, label: "Items", value: "4" },
    ],
    action: (
      <Button variant="secondary" size="sm" icon={ExternalLink}>
        Open in project
      </Button>
    ),
  },
};
