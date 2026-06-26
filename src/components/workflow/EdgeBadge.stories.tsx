import type { Meta, StoryObj } from "@storybook/react";
import EdgeBadge from "./EdgeBadge";

const meta: Meta<typeof EdgeBadge> = {
  title: "Workflow/EdgeBadge",
  component: EdgeBadge,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof EdgeBadge>;

export const Always: Story = { args: { condition: "always" } };
export const OnSuccess: Story = { args: { condition: "on_success" } };
export const OnFailure: Story = { args: { condition: "on_failure" } };
export const JsExpression: Story = { args: { condition: "js_expression" } };

export const AllConditions: Story = {
  render: () => (
    <div className="flex gap-4">
      <EdgeBadge condition="always" />
      <EdgeBadge condition="on_success" />
      <EdgeBadge condition="on_failure" />
      <EdgeBadge condition="js_expression" />
    </div>
  ),
};
