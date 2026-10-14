import type { Meta, StoryObj } from "@storybook/react";
import DateTime from "./DateTime";

const meta = { title: "Shared/DateTime", component: DateTime } satisfies Meta<typeof DateTime>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Relative: Story = { args: { value: "2026-10-14T09:12:00Z" } };
export const RelativeDetailed: Story = { args: { value: "2026-10-14T09:12:00Z", format: "relative_detailed" } };
export const TimeOnly: Story = { args: { value: "2026-10-14T09:12:00Z", format: "time_only" } };
export const Empty: Story = { args: { value: null } };
