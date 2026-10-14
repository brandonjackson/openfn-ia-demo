import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import SettingsTabs from "./SettingsTabs";
import { projectSettingsTabs } from "./tabs";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SettingsTabs> = {
  title: "Project settings/SettingsTabs",
  component: SettingsTabs,
  decorators: [withRouter],
  args: { tabs: projectSettingsTabs, active: "project" },
};
export default meta;
type Story = StoryObj<typeof SettingsTabs>;

export const Setup: Story = {};
export const WebhookSecurity: Story = { args: { active: "webhook_security" } };
function InteractiveTabs(args: ComponentProps<typeof SettingsTabs>) {
  const [active, setActive] = useState(args.active);
  return <SettingsTabs {...args} active={active} onSelect={setActive} />;
}

export const Interactive: Story = { render: (args) => <InteractiveTabs {...args} /> };
