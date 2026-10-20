import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Clock, FlaskConical, Folder, FolderKanban, Lock } from "lucide-react";
import Picker from "./Picker";
import { recentProjects } from "../mock-data/projects";
import { versionOptions, workflowVersions } from "../mock-data/workflow";

const projectOptions = recentProjects.map((p) => ({ id: p.id, label: p.name }));
const sandboxOptions = recentProjects[1].sandboxes.map((s) =>
  s === "main" ? { id: s, label: s, icon: Lock, tag: "Read only" } : { id: s, label: s }
);

/** Keeps the selection in state so clicking an option updates the trigger. */
function ControlledPicker(args: ComponentProps<typeof Picker>) {
  const [value, setValue] = useState(args.value);
  return <Picker {...args} value={value} onChange={setValue} />;
}

const meta: Meta<typeof Picker> = {
  title: "Components/Picker",
  component: Picker,
  decorators: [
    (Story) => (
      <div className="h-96">
        <Story />
      </div>
    ),
  ],
  render: (args) => <ControlledPicker {...args} />,
};

export default meta;
type Story = StoryObj<typeof Picker>;

export const Project: Story = {
  args: {
    icon: Folder,
    ariaLabel: "Switch project",
    options: projectOptions,
    value: "project-a",
    footerAction: { label: "View all", icon: FolderKanban, onClick: () => {} },
  },
};

export const ProjectOpen: Story = {
  args: { ...Project.args, defaultOpen: true },
};

export const LongProjectName: Story = {
  args: { ...Project.args, value: "malawi-chw-referrals" },
};

export const Sandbox: Story = {
  args: {
    icon: FlaskConical,
    ariaLabel: "Switch sandbox",
    options: sandboxOptions,
    value: "main",
    footerAction: { label: "View all", icon: FlaskConical, onClick: () => {} },
    defaultOpen: true,
  },
};

export const Version: Story = {
  args: {
    icon: Clock,
    ariaLabel: "Switch version",
    options: versionOptions(workflowVersions),
    value: "latest",
    menuWidthClass: "w-80",
    defaultOpen: true,
  },
};
