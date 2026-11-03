import type { Meta, StoryObj } from "@storybook/react";
import MobileTopBar from "./MobileTopBar";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof MobileTopBar> = {
  title: "Components/MobileTopBar",
  component: MobileTopBar,
  decorators: [withRouter],
  parameters: {
    layout: "fullscreen",
  },
  args: { onOpenMenu: () => {} },
};

export default meta;
type Story = StoryObj<typeof MobileTopBar>;

/** Only shows below the `md` breakpoint; narrow the canvas to see it. */
export const Default: Story = {};
