import type { Meta, StoryObj } from "@storybook/react";
import TextPingLoader from "./TextPingLoader";

const meta = { title: "History/TextPingLoader", component: TextPingLoader } satisfies Meta<typeof TextPingLoader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Nothing yet" } };
export const OnDark: Story = {
  args: { children: "Waiting for worker" },
  render: (args) => (
    <div className="relative rounded-md p-12 text-center bg-gray-700 font-mono text-gray-200">
      <TextPingLoader {...args} />
    </div>
  ),
};
