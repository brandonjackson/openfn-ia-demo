import type { Meta, StoryObj } from "@storybook/react";
import ProfileCard, { ProfileCardHeading } from "./ProfileCard";

const meta: Meta<typeof ProfileCard> = { title: "Profile/ProfileCard", component: ProfileCard };
export default meta;
type Story = StoryObj<typeof ProfileCard>;

export const Default: Story = { args: { children: <span className="text-xl">Delete account</span> } };
export const WithHeading: Story = {
  args: { children: <ProfileCardHeading title="GitHub Access" description="Linking your OpenFn account to your GitHub account allows you to manage version control across your projects." /> },
};
