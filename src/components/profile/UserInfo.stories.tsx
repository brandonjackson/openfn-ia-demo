import type { Meta, StoryObj } from "@storybook/react";
import UserInfo from "./UserInfo";
import { currentUser } from "../../mock-data/users";

const meta: Meta<typeof UserInfo> = { title: "Profile/UserInfo", component: UserInfo, args: { user: currentUser } };
export default meta;
export const Default: StoryObj<typeof UserInfo> = {};
