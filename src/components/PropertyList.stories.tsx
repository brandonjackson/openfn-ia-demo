import type { Meta, StoryObj } from "@storybook/react";
import { Folder, KeyRound, Webhook, Workflow } from "lucide-react";
import PropertyList from "./PropertyList";
import TextLink from "./TextLink";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";

const project = projects[0];
const service = project.services[0];

const meta: Meta<typeof PropertyList> = {
  title: "Components/PropertyList",
  component: PropertyList,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof PropertyList>;

export const Default: Story = {
  args: {
    properties: [
      { icon: Folder, label: "Project", value: <TextLink to={`/projects/${project.id}`}>{project.name}</TextLink> },
      { icon: Workflow, label: "Workflow", value: <TextLink to={`/workflow-editor/${service.workflowId}`}>{service.workflowId}</TextLink> },
      { icon: Webhook, label: "Endpoint", value: <code className="font-mono text-xs">{service.api!.invocation}</code> },
      { icon: KeyRound, label: "Auth", value: service.api!.auth },
    ],
  },
};

/** Plain: the same pairs on a bare grid, as the inspector lays out a step's config. */
export const Plain: Story = {
  args: {
    variant: "plain",
    properties: [
      { label: "Project", value: <TextLink to={`/projects/${project.id}`}>{project.name}</TextLink> },
      { label: "Endpoint", value: <code className="font-mono text-xs">{service.api!.invocation}</code> },
      { label: "Auth", value: service.api!.auth },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
