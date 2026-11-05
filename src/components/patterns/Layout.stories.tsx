import type { Meta, StoryObj } from "@storybook/react";
import Layout from "./Layout";
import { withRouterAt } from "../../stories/decorators";

const meta: Meta<typeof Layout> = {
  title: "Patterns/Layout",
  component: Layout,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Layout>;

/** The frame every page outside the editor sits in: sidebar, and the page's column. */
export const Default: Story = {
  decorators: [withRouterAt("/overview")],
  args: { children: <p className="text-sm text-gray-500">The page goes here.</p> },
};

/** Inside a project, the sidebar swaps to the project's own menu. */
export const InAProject: Story = {
  decorators: [withRouterAt("/projects/project-a/workflows")],
  args: { children: <p className="text-sm text-gray-500">The page goes here.</p> },
};
