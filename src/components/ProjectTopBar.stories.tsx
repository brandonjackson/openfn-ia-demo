import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ProjectTopBar from "./ProjectTopBar";
import { MAIN_BRANCH } from "./BranchPicker";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof ProjectTopBar> = {
  title: "Components/ProjectTopBar",
  component: ProjectTopBar,
  decorators: [
    withRouter,
    (Story) => (
      <div className="h-96">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
  render: function Render(args) {
    const [branch, setBranch] = useState(args.branchId);
    return <ProjectTopBar {...args} branchId={branch} onBranchChange={setBranch} />;
  },
};

export default meta;
type Story = StoryObj<typeof ProjectTopBar>;

export const Default: Story = {
  args: { project: projects[0], projects, branchId: MAIN_BRANCH, onBranchChange: () => {} },
};

export const InSandbox: Story = {
  args: { ...Default.args, branchId: "new-intake-form" },
};

export const LongNames: Story = {
  args: {
    project: projects.find((p) => p.id === "malawi-chw-referrals")!,
    projects,
    branchId: "commcare-api-v2-migration-with-very-long-name",
    onBranchChange: () => {},
  },
};
