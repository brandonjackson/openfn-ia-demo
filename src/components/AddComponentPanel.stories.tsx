import type { Meta, StoryObj } from "@storybook/react";
import AddComponentPanel from "./AddComponentPanel";
import { componentTypes } from "../component-types";

const meta: Meta<typeof AddComponentPanel> = {
  title: "Components/AddComponentPanel",
  component: AddComponentPanel,
  decorators: [
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AddComponentPanel>;

/** As shown on a project's Components page: every type except workflows. */
export const Default: Story = {
  args: { options: componentTypes.filter((t) => t.type !== "Workflow") },
};

export const AllTypes: Story = {
  args: { options: componentTypes },
};
