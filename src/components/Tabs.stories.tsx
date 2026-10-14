import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Tabs, { type Tab } from "./Tabs";
import IconButton from "./IconButton";
import { withRouter } from "../stories/decorators";
import { projectSettingsTabs } from "./project-settings/tabs";

const meta: Meta<typeof Tabs> = { title: "Shared/Tabs", component: Tabs, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof Tabs>;

function Stateful(props: Partial<React.ComponentProps<typeof Tabs>> & { tabs: Tab[] }) {
  const [active, setActive] = useState(props.tabs[0].id);
  return <Tabs {...props} active={active} onChange={setActive} />;
}

const envs: Tab[] = ["main", "staging", "production"].map((t) => ({ id: t, label: t }));

export const Underline: Story = { render: () => <Stateful label="Environments" tabs={envs} /> };

export const WithAddButton: Story = {
  render: () => <Stateful label="Environments" tabs={envs} after={<IconButton icon="hero-plus" label="Add new environment" />} />,
};

export const WithIconsAndDisabled: Story = {
  render: () => (
    <Stateful
      label="Run details"
      tabs={[
        { id: "log", label: "Log", icon: "hero-command-line" },
        { id: "input", label: "Input", icon: "hero-arrow-down-on-square" },
        { id: "output", label: "Output", icon: "hero-arrow-up-on-square", disabled: true, disabledReason: "Select a step to view its output" },
      ]}
    />
  ),
};

export const Pill: Story = {
  render: () => (
    <Stateful
      variant="pill"
      fill
      className="w-96"
      tabs={[
        { id: "empty", label: "Empty", icon: "hero-document" },
        { id: "custom", label: "Custom", icon: "hero-pencil-square" },
        { id: "existing", label: "Existing", icon: "hero-queue-list" },
      ]}
    />
  ),
};

export const PillRouteLinks: Story = {
  args: {
    variant: "pill",
    active: "work-orders",
    tabs: [
      { id: "work-orders", label: "Work Orders", to: "/history" },
      { id: "channel-logs", label: "Channel Logs", to: "/history/channels" },
    ],
  },
};

export const Vertical: Story = { render: () => <Stateful orientation="vertical" label="Project settings" tabs={projectSettingsTabs} /> };
