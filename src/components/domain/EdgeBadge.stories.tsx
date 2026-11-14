import type { Meta, StoryObj } from "@storybook/react";
import EdgeBadge from "./EdgeBadge";

const meta: Meta<typeof EdgeBadge> = {
  title: "Domain/EdgeBadge",
  component: EdgeBadge,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof EdgeBadge>;

export const Always: Story = { args: { condition: "always" } };
export const OnSuccess: Story = { args: { condition: "on_success" } };
export const OnFailure: Story = { args: { condition: "on_failure" } };
export const JsExpression: Story = { args: { condition: "js_expression", expression: "state.exactMatch === true" } };

/** A path with a label: drawn in a tab beside the badge. */
export const WithLabel: Story = { args: { condition: "js_expression", expression: "state.exactMatch === true", label: "Exact match", onClick: () => {} } };

/** A path that's off: dashed and faded. */
export const Disabled: Story = { args: { condition: "on_failure", label: "Park it for later", enabled: false, onClick: () => {} } };

/** The path open in the inspector. */
export const Selected: Story = { args: { condition: "on_success", selected: true, onClick: () => {} } };

export const AllConditions: Story = {
  render: () => (
    <div className="flex gap-4">
      <EdgeBadge condition="always" />
      <EdgeBadge condition="on_success" />
      <EdgeBadge condition="on_failure" />
      <EdgeBadge condition="js_expression" />
      <EdgeBadge condition="js_expression" label="No match" />
      <EdgeBadge condition="on_success" enabled={false} />
    </div>
  ),
};
