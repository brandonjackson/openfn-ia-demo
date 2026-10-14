import type { Meta, StoryObj } from "@storybook/react";
import AuthCard, { AuthFooterLinks } from "./AuthCard";
import Button from "../Button";
import { TextInput } from "../Inputs";
import { authMessages } from "../../mock-data/auth";
import { withRouter } from "../../stories/decorators";
import TextLink from "../TextLink";

const meta: Meta<typeof AuthCard> = { title: "Auth/AuthCard", component: AuthCard, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof AuthCard>;

const body = (
  <>
    <TextInput id="email" type="email" label="Email" required />
    <Button type="submit">Send instructions to reset password</Button>
    <AuthFooterLinks divider left={<TextLink variant="plain" to="/users/log_in">Log in</TextLink>} right={<TextLink variant="plain" to="/users/register">Register</TextLink>} />
  </>
);

export const Default: Story = { args: { children: body } };
export const WithError: Story = { args: { error: authMessages.invalidLogin, children: body } };
export const WithInfo: Story = { args: { info: authMessages.resetSent, children: body } };
