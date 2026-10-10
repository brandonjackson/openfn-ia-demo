import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";
import { withRouterAt } from "../stories/decorators";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="flex h-screen">
      <Sidebar />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** Org level: the top-level IA, including the Projects tab. */
export const Default: Story = {
  decorators: [withRouterAt("/projects")],
};

/** Inside a project: the project's own menu, with a way back to all projects. */
export const InsideProject: Story = {
  decorators: [withRouterAt("/projects/project-a/workflows")],
};

/** A long project name wraps to two lines and then truncates. */
export const LongProjectName: Story = {
  decorators: [withRouterAt("/projects/malawi-chw-referrals")],
};
