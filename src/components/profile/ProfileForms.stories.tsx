import type { Meta, StoryObj } from "@storybook/react";
import { BasicInfoForm, ChangeEmailForm, ChangePasswordForm } from "./ProfileForms";
import { currentUser } from "../../mock-data/users";

const meta: Meta = { title: "Profile/ProfileForms" };
export default meta;
type Story = StoryObj;

export const BasicInfo: Story = { render: () => <BasicInfoForm user={currentUser} /> };
export const ChangeEmail: Story = { render: () => <ChangeEmailForm /> };
export const ChangePassword: Story = { render: () => <ChangePasswordForm /> };
