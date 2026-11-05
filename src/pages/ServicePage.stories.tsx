import type { Meta, StoryObj } from "@storybook/react";
import ServicePage from "./ServicePage";
import { withRouter } from "../stories/decorators";
import { projects } from "../fixtures/projects";
import type { IANode } from "../model/ia-tree";
import type { Project } from "../model/projects";
import type { ServicePageData } from "../model/page-data";

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

const meta: Meta<typeof ServicePage> = {
  title: "Pages/ServicePage",
  component: ServicePage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ServicePage>;

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

/** A workflow service published to X-Road: other members call it, and its usage and catalogue record show. */
export const OnXRoad: Story = { args: storyArgs(projects.find((p) => p.id === "case-surveillance")!, 0) };

/** Not on X-Road or MCP yet, so both cards offer to turn it on. */
export const NotOnXRoadYet: Story = {
  args: (() => {
    const args = storyArgs(projects.find((p) => p.id === "case-surveillance")!, 0);
    return { ...args, data: { ...args.data, service: { ...args.data.service, xroad: undefined, mcpEnabled: false } } };
  })(),
};
