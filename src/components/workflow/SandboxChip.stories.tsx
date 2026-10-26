import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SandboxChip from "./SandboxChip";
import { projects } from "../../mock-data/projects";

function Stateful(args: ComponentProps<typeof SandboxChip>) {
    const [value, setValue] = useState(args.value);
    return <SandboxChip {...args} value={value} onChange={setValue} />;
}

const meta: Meta<typeof SandboxChip> = {
  title: "Workflow/SandboxChip",
  component: SandboxChip,
  decorators: [
    (Story) => (
      <div className="h-72 p-4">
        <Story />
      </div>
    ),
  ],
  args: { sandboxes: projects[0].sandboxes, onNewSandbox: () => {}, onViewAll: () => {} },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof SandboxChip>;

export const OnMain: Story = { args: { value: "main" } };

export const Paused: Story = { args: { value: "main", live: false } };

export const InSandbox: Story = { args: { value: projects[0].sandboxes[1] } };

export const Open: Story = { args: { value: projects[0].sandboxes[1], defaultOpen: true } };
