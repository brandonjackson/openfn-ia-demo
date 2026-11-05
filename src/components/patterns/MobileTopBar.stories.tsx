import type { Meta, StoryObj } from "@storybook/react";
import MobileTopBar from "./MobileTopBar";
import { withRouter } from "../../stories/decorators";
import { currentInstance } from "../../fixtures/user";

const meta: Meta<typeof MobileTopBar> = {
  title: "Patterns/MobileTopBar",
  component: MobileTopBar,
  decorators: [withRouter],
  parameters: {
    layout: "fullscreen",
  },
  args: { onOpenMenu: () => {}, instance: currentInstance },
};

export default meta;
type Story = StoryObj<typeof MobileTopBar>;

/** Only shows below the `md` breakpoint; narrow the canvas to see it. */
export const Default: Story = {};
