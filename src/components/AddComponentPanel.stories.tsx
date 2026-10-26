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

/** Inside a dialog, as the workflow editor's explorer opens it. */
export const InDialog: Story = {
  args: { options: componentTypes.filter((t) => t.type !== "Workflow"), columns: 2, bare: true },
  decorators: [
    (Story) => (
      <div className="max-w-2xl rounded-xl border border-gray-200 p-5">
        <Story />
      </div>
    ),
  ],
};
