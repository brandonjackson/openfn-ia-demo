import type { Meta, StoryObj } from "@storybook/react";
import PlaceholderPage from "./PlaceholderPage";
import { withRouterAt } from "../../stories/decorators";
import { findNodeByPath } from "../../app/ia-utils";
import { iaTree } from "../../model/ia-tree";

const deployments = findNodeByPath(iaTree, "/projects/project-a/deployments")!;

const meta: Meta<typeof PlaceholderPage> = {
  title: "Pages/PlaceholderPage",
  component: PlaceholderPage,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof PlaceholderPage>;

/** A page in the IA that hasn't been built yet: its title, description and the pages under it. */
export const Default: Story = {
  decorators: [withRouterAt("/projects/project-a/deployments")],
  args: {
    node: deployments.node,
    ancestors: deployments.ancestors,
    currentPath: "/projects/project-a/deployments",
  },
};
