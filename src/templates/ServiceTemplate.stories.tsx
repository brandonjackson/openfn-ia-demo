import type { Meta, StoryObj } from "@storybook/react";
import ServiceTemplate from "./ServiceTemplate";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";
import type { IANode } from "../ia-tree";
import type { Project } from "../mock-data/projects";
import type { ServicePageData } from "../page-data";

const node: IANode = { id: "service", label: "Service", pageType: "service" };

function storyArgs(project: Project, serviceIndex: number) {
  const service = project.services[serviceIndex];
  const data: ServicePageData = {
    pageType: "service",
    projectId: project.id,
    projectName: project.name,
    service,
    workflow: project.components.find((c) => c.id === service.workflowId),
    api: service.api!,
  };
  return {
    node,
    ancestors: [
      { node: { id: "projects", label: "Projects" }, path: "/projects" },
      { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
      { node: { id: "services", label: "Services" }, path: "/service-catalog" },
    ],
    currentPath: `/projects/${project.id}/services/${service.id}`,
    data,
  };
}

const meta: Meta<typeof ServiceTemplate> = {
  title: "Templates/ServiceTemplate",
  component: ServiceTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ServiceTemplate>;

/** A live webhook service: endpoint, request fields and examples. */
export const Webhook: Story = { args: storyArgs(projects[0], 0) };

/** A scheduled service has no request, only what it produces. */
export const Scheduled: Story = { args: storyArgs(projects[2], 0) };

/** A draft service without a linked workflow or written-up API. */
export const Draft: Story = {
  args: (() => {
    const args = storyArgs(projects[0], 0);
    return {
      ...args,
      data: {
        ...args.data,
        service: { ...projects[0].services[1], workflowId: undefined },
        workflow: undefined,
      },
    };
  })(),
};

/** A lookup service other workflows and agents call for answers. */
export const Lookup: Story = { args: storyArgs(projects[2], 1) };
