import type { Meta, StoryObj } from "@storybook/react";
import Link from "./Link";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof Link> = {
  title: "Primitives/Link",
  component: Link,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof Link>;

/** Unstyled: it takes its look from whatever it wraps. */
export const Default: Story = {
  args: { to: "/connected-systems", children: "Systems" },
};

/** Wrapping a block, as a row or card does. */
export const AroundABlock: Story = {
  args: {
    to: "/projects/project-a",
    className: "block rounded-lg border border-gray-200 p-4 hover:bg-gray-50",
    children: "A whole card that links to the project",
  },
};
