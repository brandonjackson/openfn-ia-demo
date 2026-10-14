import type { Meta, StoryObj } from "@storybook/react";
import AuthPanelLayout, { AuthPanel, AuthPanelHint, AuthPanelTitle, HavingProblems } from "./AuthPanelLayout";
import Button from "../Button";
import { TextInput } from "../Inputs";
import TextLink from "../TextLink";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof AuthPanelLayout> = {
  title: "Auth/AuthPanelLayout",
  component: AuthPanelLayout,
  decorators: [withRouter],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AuthPanelLayout>;

const panels = (
  <>
    <AuthPanel>
      <AuthPanelTitle>Authentication Code</AuthPanelTitle>
      <TextInput id="code" placeholder="XXXXXX" />
      <Button className="w-full">Verify</Button>
      <AuthPanelHint>Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code.</AuthPanelHint>
    </AuthPanel>
    <HavingProblems>
      <li>
        <TextLink to="#">Use your backup code</TextLink>
      </li>
    </HavingProblems>
  </>
);

export const Centered: Story = { args: { title: "Two-factor authentication", children: panels } };
export const Top: Story = {
  args: {
    title: "Confirm your email address",
    align: "top",
    children: (
      <AuthPanel>
        <p className="text-sm text-gray-600">Panel</p>
      </AuthPanel>
    ),
  },
};
