import type { Meta, StoryObj } from "@storybook/react";
import ChildCard from "./ChildCard";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../ia-tree";

const meta: Meta<typeof ChildCard> = {
  title: "Components/ChildCard",
  component: ChildCard,
  decorators: [withRouter],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ChildCard>;

const baseNode: IANode = {
  id: "planning-intake",
  label: "Planning Application Intake",
  description: "Receives planning applications from the e-planning portal.",
};

export const Default: Story = {
  args: {
    node: baseNode,
    basePath: "/projects/project-a/services",
  },
};

export const WithBadges: Story = {
  args: {
    node: { ...baseNode, badges: ["Live"] },
    basePath: "/projects/project-a/services",
  },
};

export const WithChildren: Story = {
  args: {
    node: {
      ...baseNode,
      children: [
        { id: "a", label: "Sub-page A" },
        { id: "b", label: "Sub-page B" },
        { id: "c", label: "Sub-page C" },
      ],
    },
    basePath: "/projects/project-a/services",
  },
};

export const Grid: Story = {
  name: "Card grid (typical layout)",
  render: () => {
    const nodes: IANode[] = [
      { id: "dhis2", label: "DHIS2", description: "Health information management system.", badges: ["Live"] },
      { id: "salesforce", label: "Salesforce", description: "CRM platform." },
      { id: "commcare", label: "CommCare", description: "Mobile data collection.", badges: ["Draft"], children: [{ id: "x", label: "Channels" }] },
    ];
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        {nodes.map((n) => (
          <ChildCard key={n.id} node={n} basePath="/connected-systems" />
        ))}
      </div>
    );
  },
};
