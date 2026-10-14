import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import { findDataclip, steps } from "../../mock-data/history";
import StepDataclipViewer from "./StepDataclipViewer";

const meta = {
  title: "History/StepDataclipViewer",
  component: StepDataclipViewer,
  decorators: [withRouter],
} satisfies Meta<typeof StepDataclipViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

const base = { projectId: "p", canEditDataRetention: true, runFinished: true, inputOrOutput: "input" as const };

export const Input: Story = { args: { ...base, step: steps[0], dataclip: findDataclip("dc-7f3a91") } };
export const NoOutput: Story = {
  args: { ...base, inputOrOutput: "output", step: { ...steps[3], finishedAt: null }, dataclip: undefined },
};
export const Wiped: Story = { args: { ...base, step: steps[0], dataclip: findDataclip("dc-wiped") } };
export const Running: Story = { args: { ...base, runFinished: false, step: undefined, dataclip: undefined } };
