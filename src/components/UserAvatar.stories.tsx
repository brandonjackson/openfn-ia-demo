import type { Meta, StoryObj } from "@storybook/react";
import UserAvatar from "./UserAvatar";

const meta: Meta<typeof UserAvatar> = { title: "Shell/UserAvatar", component: UserAvatar, args: { firstName: "Amy", lastName: "Admin" } };
export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const ExtraSmall: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const FirstNameOnly: Story = { args: { lastName: null } };
