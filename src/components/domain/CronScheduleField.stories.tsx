import type { Meta, StoryObj } from "@storybook/react";
import CronScheduleField from "./CronScheduleField";

const meta: Meta<typeof CronScheduleField> = {
  title: "Domain/CronScheduleField",
  component: CronScheduleField,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: { value: "0 6 * * *", onChange: () => {} },
};

export default meta;
type Story = StoryObj<typeof CronScheduleField>;

/** Every day at 06:00. */
export const Daily: Story = {};
/** Every Monday. */
export const Weekly: Story = { args: { value: "30 6 * * 1" } };
/** A schedule no frequency names: Custom, read as itself. */
export const Custom: Story = { args: { value: "*/15 9-17 * * 1-5" } };
/** On main: it only reads. */
export const ReadOnly: Story = { args: { readOnly: true, onChange: undefined } };
