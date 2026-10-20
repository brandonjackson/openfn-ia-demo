import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Settings, KeyRound, Users, Database, UserCircle, Terminal } from "lucide-react";
import SettingsNav from "./SettingsNav";
import { withRouter } from "../stories/decorators";

const projectItems = [
  { id: "setup", label: "Setup", icon: Settings },
  { id: "credentials", label: "Credentials", icon: KeyRound },
  { id: "collaboration", label: "Collaboration", icon: Users },
  { id: "data-storage", label: "Data Storage", icon: Database },
];

const meta: Meta<typeof SettingsNav> = {
  title: "Components/SettingsNav",
  component: SettingsNav,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SettingsNav>;

function TabsDemo() {
  const [active, setActive] = useState("setup");
  return <SettingsNav items={projectItems} activeId={active} onSelect={setActive} />;
}

export const Tabs: Story = {
  name: "Tabs (local state)",
  render: () => <TabsDemo />,
};

export const RouteLinks: Story = {
  name: "Route links",
  args: {
    activeId: "api-tokens",
    items: [
      { id: "profile", label: "Profile", icon: UserCircle, to: "/user-settings/profile" },
      { id: "credentials", label: "Credentials", icon: KeyRound, to: "/user-settings/credentials" },
      { id: "api-tokens", label: "API Tokens", icon: Terminal, to: "/user-settings/api-tokens" },
    ],
  },
};
