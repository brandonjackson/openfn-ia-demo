import type { Meta, StoryObj } from "@storybook/react";
import CanvasLayout from "./CanvasLayout";
import WorkflowCanvas from "../domain/WorkflowCanvas";
import ReadOnlyNotice from "../domain/ReadOnlyNotice";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import { adaptorInfo } from "../../fixtures/adaptor-reference";
import { connectedSystems } from "../../fixtures/connected-systems";

const meta: Meta<typeof CanvasLayout> = {
  title: "Patterns/CanvasLayout",
  component: CanvasLayout,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-screen bg-gray-50">
        <Story />
      </div>
    ),
  ],
  args: {
    children: <WorkflowCanvas workflow={nationalIdWorkflow} adaptors={adaptorInfo} systems={connectedSystems} height={760} />,
  },
};

export default meta;
type Story = StoryObj<typeof CanvasLayout>;

export const Default: Story = {};

/** A bar pinned to the bottom, e.g. main's read-only notice. */
export const WithBottom: Story = {
  args: { bottom: <ReadOnlyNotice onEditInSandbox={() => {}} /> },
};

/** A card floating over the right, e.g. the step inspector. */
export const WithRightOverlay: Story = {
  args: {
    rightOverlay: (
      <div className="w-[380px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
        <p className="text-sm text-gray-500">Right overlay</p>
      </div>
    ),
  },
};
