import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SandboxChip from "./SandboxChip";
import { projects } from "../../fixtures/projects";

function Stateful(args: ComponentProps<typeof SandboxChip>) {
    const [value, setValue] = useState(args.value);
    return <SandboxChip {...args} value={value} onChange={setValue} />;
}

const meta: Meta<typeof SandboxChip> = {
  title: "Domain/SandboxChip",
  component: SandboxChip,
  decorators: [
    (Story) => (
      <div className="h-[28rem] p-4">
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

export const InSandbox: Story = { args: { value: projects[0].sandboxes[1] } };

const changes = [
  { kind: "added" as const, summary: "Added step Check for a duplicate application" },
  { kind: "changed" as const, summary: "Changed code in Search for duplicate citizens in Identity" },
  { kind: "removed" as const, summary: "Removed step Notify applicant of existing national ID" },
];

/** In a sandbox with changes: the chip counts them. */
export const WithChanges: Story = { args: { value: projects[0].sandboxes[1], changes, onPromote: () => {} } };

/** Open in a sandbox: the changes and "Create promotion request", then the sandboxes to switch to. */
export const Open: Story = { args: { value: projects[0].sandboxes[1], changes, onPromote: () => {}, defaultOpen: true } };

/** Open with nothing changed yet: no count, and no promotion request. */
export const OpenNoChanges: Story = { args: { value: projects[0].sandboxes[1], defaultOpen: true } };

/** Without the right to promote, the list stays and the button goes. */
export const CantPromote: Story = { args: { value: projects[0].sandboxes[1], changes, defaultOpen: true } };

/** Open on main: just the sandboxes to switch to. */
export const OpenOnMain: Story = { args: { value: "main", defaultOpen: true } };
