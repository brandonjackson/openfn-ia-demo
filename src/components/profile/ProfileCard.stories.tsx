import type { Meta, StoryObj } from "@storybook/react";
import ProfileCard from "./ProfileCard";
import Button from "../Button";

const meta: Meta<typeof ProfileCard> = { title: "Profile/ProfileCard", component: ProfileCard, args: { annotation: "profile-github" } };
export default meta;
type Story = StoryObj<typeof ProfileCard>;

export const TitleOnly: Story = { args: { title: "Delete account", action: <Button theme="danger">Delete my account</Button> } };
export const WithDescription: Story = {
  args: {
    title: "GitHub Access",
    description: "Linking your OpenFn account to your GitHub account allows you to manage version control across your projects.",
    action: <Button>Connect your GitHub Account</Button>,
  },
};
