import type { Meta, StoryObj } from "@storybook/react";
import AIDisclaimerFooter from "./AIDisclaimerFooter";

const meta: Meta<typeof AIDisclaimerFooter> = { title: "Workflow/AIDisclaimerFooter", component: AIDisclaimerFooter };
export default meta;
type Story = StoryObj<typeof AIDisclaimerFooter>;

export const Default: Story = {};
export const Muted: Story = { args: { muted: true } };
