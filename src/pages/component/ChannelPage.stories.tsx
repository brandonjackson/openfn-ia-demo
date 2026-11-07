import type { Meta, StoryObj } from "@storybook/react";
import ChannelPage from "./ChannelPage";
import { withRouter } from "../../stories/decorators";
import { projects } from "../../fixtures/projects";
import type { Project } from "../../model/projects";
import { channelDetails } from "../../fixtures/channels";
import type { IANode } from "../../model/ia-tree";
import type { ChannelPageData } from "./ChannelPage";

const node: IANode = { id: "component", label: "Component", pageType: "component" };

function storyArgs(project: Project, componentId: string) {
  const component = project.components.find((c) => c.id === componentId)!;
  const data: ChannelPageData = {
    projectId: project.id,
    projectName: project.name,
    component,
    channel: channelDetails(component),
  };
  return {
    node,
    ancestors: [
      { node: { id: "projects", label: "Projects" }, path: "/projects" },
      { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
      { node: { id: "components", label: "Components" }, path: `/projects/${project.id}/components` },
    ],
    currentPath: `/projects/${project.id}/components/${component.id}`,
    data,
    // As the wrapper does: a channel whose messages come from a workflow can open it.
    onOpenWorkflow: data.channel.workflowId ? () => {} : undefined,
    onOpenRun: data.channel.workflowId ? () => {} : undefined,
    onEditChannel: async () => {},
    onSetEnabled: async () => {},
    onDeleteChannel: async () => {},
    draft: {
      name: component.name,
      description: component.description,
      channelType: data.channel.channelType,
      system: data.channel.system.name,
      destinationUrl: data.channel.endpoint,
      enabled: true,
    },
  };
}

const meta: Meta<typeof ChannelPage> = {
  title: "Pages/ChannelPage",
  component: ChannelPage,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof ChannelPage>;

/** An event channel used by a workflow: loading a run from a message opens it in the editor. */
export const Event: Story = { args: storyArgs(projects[0], "eplanning-submission-received") };

/** A write channel used by the same workflow. */
export const Write: Story = { args: storyArgs(projects[0], "case-management-create-case") };

/** A channel with no linked workflow, so its messages have no runs to load. */
export const NoWorkflow: Story = {
  args: storyArgs(projects.find((p) => p.components.some((c) => c.id === "client-registry-search"))!, "client-registry-search"),
};

/** Turned off: it refuses every request until it's turned back on. */
export const TurnedOff: Story = {
  args: (() => {
    const args = storyArgs(projects[0], "case-management-create-case");
    return { ...args, data: { ...args.data, channel: { ...args.data.channel, enabled: false } } };
  })(),
};
