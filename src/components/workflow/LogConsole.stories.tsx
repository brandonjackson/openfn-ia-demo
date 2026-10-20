import type { Meta, StoryObj } from "@storybook/react";
import LogConsole from "./LogConsole";
import { sampleRun } from "../../mock-data/workflow";

const meta: Meta<typeof LogConsole> = {
  title: "Workflow/LogConsole",
  component: LogConsole,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LogConsole>;

export const Default: Story = { args: { lines: sampleRun.logs } };
