import type { Meta, StoryObj } from "@storybook/react";
import AuthCard, { AuthFooterLinks } from "./AuthCard";
import { Link } from "react-router-dom";
import Button from "../Button";
import { TextInput } from "../Inputs";
import { authMessages } from "../../mock-data/auth";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof AuthCard> = { title: "Auth/AuthCard", component: AuthCard, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof AuthCard>;

const body = (
  <>
    <TextInput id="email" type="email" label="Email" required />
    <Button type="submit">Send instructions to reset password</Button>
    <AuthFooterLinks divider left={<Link to="/users/log_in">Log in</Link>} right={<Link to="/users/register">Register</Link>} />
  </>
);

export const Default: Story = { args: { children: body } };
export const WithError: Story = { args: { error: authMessages.invalidLogin, children: body } };
export const WithInfo: Story = { args: { info: authMessages.resetSent, children: body } };
