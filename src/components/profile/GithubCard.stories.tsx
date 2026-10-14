import type { Meta, StoryObj } from "@storybook/react";
import GithubCard from "./GithubCard";

const meta: Meta<typeof GithubCard> = { title: "Profile/GithubCard", component: GithubCard };
export default meta;
type Story = StoryObj<typeof GithubCard>;

export const OauthNotEnabled: Story = { args: { oauthEnabled: false, connected: false } };
export const NotConnected: Story = { args: { oauthEnabled: true, connected: false } };
export const Connected: Story = { args: { oauthEnabled: true, connected: true } };
