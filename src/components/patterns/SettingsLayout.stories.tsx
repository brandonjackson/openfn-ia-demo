import type { Meta, StoryObj } from "@storybook/react";
import { UserCircle, KeyRound, Terminal } from "lucide-react";
import SettingsLayout from "./SettingsLayout";
import Breadcrumbs from "../domain/Breadcrumbs";
import SectionHeading from "../primitives/SectionHeading";
import Card from "../primitives/Card";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SettingsLayout> = {
  title: "Patterns/SettingsLayout",
  component: SettingsLayout,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SettingsLayout>;

export const Default: Story = {
  args: {
    breadcrumbs: <Breadcrumbs ancestors={[{ label: "User settings", path: "/user-settings" }]} current="Profile" />,
    title: "User settings",
    description: "Manage your profile, personal credentials and API tokens.",
    activeId: "profile",
    navItems: [
      { id: "profile", label: "Profile", icon: UserCircle, to: "/user-settings/profile" },
      { id: "credentials", label: "Credentials", icon: KeyRound, to: "/user-settings/credentials" },
      { id: "api-tokens", label: "API tokens", icon: Terminal, to: "/user-settings/api-tokens" },
    ],
    children: (
      <>
        <SectionHeading title="Profile" description="Section content renders here." />
        <Card title="Example card" description="Any section content goes in the right-hand column." />
      </>
    ),
  },
};
