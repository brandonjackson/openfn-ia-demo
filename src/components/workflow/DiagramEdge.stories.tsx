import type { Meta, StoryObj } from "@storybook/react";
import DiagramEdge from "./DiagramEdge";

const meta: Meta<typeof DiagramEdge> = {
  title: "Workflow/DiagramEdge",
  component: DiagramEdge,
  decorators: [(Story) => <div className="relative h-96 bg-gray-100"><div className="absolute left-40 top-4"><Story /></div></div>],
  args: { id: "e1", source: { x: 0, y: 0 }, target: { x: 0, y: 260 }, conditionType: "on_job_success" },
};
export default meta;
type Story = StoryObj<typeof DiagramEdge>;

export const OnSuccess: Story = {};
export const OnFailureCurved: Story = { args: { conditionType: "on_job_failure", target: { x: 185, y: 260 } } };
export const Always: Story = { args: { conditionType: "always" } };
export const Disabled: Story = { args: { conditionType: "always", enabled: false } };
export const JsExpressionWithLabel: Story = {
  args: { conditionType: "js_expression", conditionLabel: "Has overdue referrals", target: { x: -185, y: 260 } },
};
export const Selected: Story = { args: { selected: true } };
