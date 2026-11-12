import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import TriggerStatusMenu from "./TriggerStatusMenu";
import { projects } from "../../fixtures/projects";

function Stateful(args: ComponentProps<typeof TriggerStatusMenu>) {
  const [live, setLive] = useState(args.live);
  return <TriggerStatusMenu {...args} live={live} onToggle={setLive} />;
}

const meta: Meta<typeof TriggerStatusMenu> = {
  title: "Domain/TriggerStatusMenu",
  component: TriggerStatusMenu,
  decorators: [
    (Story) => (
      <div className="flex h-80 justify-end p-4">
        <Story />
      </div>
    ),
  ],
  args: { sandbox: "main", live: true, environment: "production", showEnvVars: true },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof TriggerStatusMenu>;

/** On main, live: triggers start runs. */
export const LiveOnMain: Story = {};

/** Open on main: the switch, then what runs on main use. */
export const OpenOnMain: Story = { args: { defaultOpen: true } };

/** On main, paused. */
export const PausedOnMain: Story = { args: { live: false } };

/** Open in a sandbox, paused as a new one starts: its own environment variables, run history and collections, and its environment's values, tinted where they differ from main. */
export const OpenInSandbox: Story = {
  args: { sandbox: projects[0].sandboxes[1], live: false, environment: "staging", defaultOpen: true },
};

/** Without environment variables (their flag off), they aren't listed. */
export const WithoutEnvVars: Story = { args: { showEnvVars: false, defaultOpen: true } };

/** Where you can't turn the trigger on or off, the switch is greyed out. */
export const ReadOnly: Story = { args: { defaultOpen: true, onToggle: undefined }, render: (args) => <TriggerStatusMenu {...args} /> };
