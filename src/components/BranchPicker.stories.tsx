import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import BranchPicker, { MAIN_BRANCH } from "./BranchPicker";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof BranchPicker> = {
  title: "Components/BranchPicker",
  component: BranchPicker,
  decorators: [
    withRouter,
    (Story) => (
      <div className="h-96 p-4">
        <Story />
      </div>
    ),
  ],
  // Keep the selection live so the stories can be clicked through.
  render: function Render(args) {
    const [selected, setSelected] = useState(args.selectedId);
    return <BranchPicker {...args} selectedId={selected} onSelect={setSelected} />;
  },
};

export default meta;
type Story = StoryObj<typeof BranchPicker>;

const projectA = projects[0];
const malawi = projects.find((p) => p.id === "malawi-chw-referrals")!;
const empty = projects.find((p) => p.id === "data-quality-checks")!;

export const OnMain: Story = {
  args: {
    projectId: projectA.id,
    environment: projectA.environment,
    sandboxes: projectA.sandboxes,
    selectedId: MAIN_BRANCH,
    onSelect: () => {},
  },
};

export const InSandbox: Story = {
  args: { ...OnMain.args, selectedId: "dev" },
};

export const ManySandboxesOpen: Story = {
  args: {
    projectId: malawi.id,
    environment: malawi.environment,
    sandboxes: malawi.sandboxes,
    selectedId: MAIN_BRANCH,
    onSelect: () => {},
    defaultOpen: true,
  },
};

export const NoSandboxesOpen: Story = {
  args: {
    projectId: empty.id,
    environment: empty.environment,
    sandboxes: [],
    selectedId: MAIN_BRANCH,
    onSelect: () => {},
    defaultOpen: true,
  },
};
