import type { Meta, StoryObj } from "@storybook/react";
import CodeLines from "./CodeLines";

const meta = {
  title: "History/CodeLines",
  component: CodeLines,
  decorators: [(Story) => <div className="h-64">{Story()}</div>],
} satisfies Meta<typeof CodeLines>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = { args: { lines: ["line one", "line two", "  indented line three"] } };
export const Highlighted: Story = {
  args: { lines: ["R/T Starting operation 1", "JOB Mapping registration", "R/T Operation 1 complete"], highlighted: new Set([2]) },
};
