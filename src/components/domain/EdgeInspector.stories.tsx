import type { Meta, StoryObj } from "@storybook/react";
import EdgeInspector from "./EdgeInspector";
import { nationalIdWorkflow } from "../../fixtures/workflow";

const edge = (id: string) => nationalIdWorkflow.edges.find((e) => e.id === id)!;

const meta: Meta<typeof EdgeInspector> = {
  title: "Domain/EdgeInspector",
  component: EdgeInspector,
  parameters: { layout: "centered" },
  args: {
    edge: edge("e-search-notify"),
    sourceLabel: "Search for duplicate citizens in Identity",
    targetLabel: "Notify applicant of existing national ID",
    fromTrigger: false,
    onChange: () => {},
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof EdgeInspector>;

/** An On match path, with its label and expression. */
export const OnMatch: Story = {};

/** An On success path: no expression to write. */
export const OnSuccess: Story = {
  args: { edge: edge("e-verify-search"), sourceLabel: "Verify birth registration in OpenCRVS", targetLabel: "Search for duplicate citizens in Identity" },
};

/** A path that's off. */
export const Disabled: Story = { args: { edge: { ...edge("e-search-queue"), enabled: false }, targetLabel: "Queue application for retry" } };

/** An expression Lightning warns may be unsafe to run. */
export const UnsafeExpression: Story = { args: { edge: { ...edge("e-search-notify"), expression: "require('fs')" } } };

/** A path from the trigger: Always or On match, and on whenever the trigger is. */
export const FromTrigger: Story = {
  args: { edge: edge("e-trigger-verify"), fromTrigger: true, sourceLabel: "Webhook trigger", targetLabel: "Verify birth registration in OpenCRVS" },
};

/** On main: everything reads only. */
export const ReadOnly: Story = { args: { onChange: undefined } };
