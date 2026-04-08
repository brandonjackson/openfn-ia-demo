import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  decorators: [withRouter],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar />
    </div>
  ),
};
