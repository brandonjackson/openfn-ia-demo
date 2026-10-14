import type { Meta, StoryObj } from "@storybook/react";
import AdaptorIcon from "./AdaptorIcon";

const meta: Meta<typeof AdaptorIcon> = {
  title: "Workflow/AdaptorIcon",
  component: AdaptorIcon,
  args: { name: "@openfn/language-http@latest", size: "md" },
};
export default meta;
type Story = StoryObj<typeof AdaptorIcon>;

export const Http: Story = {};
export const Dhis2Large: Story = { args: { name: "@openfn/language-dhis2@latest", size: "lg" } };
export const NoIcon: Story = { args: { name: "@openfn/language-mailchimp@latest" } };
