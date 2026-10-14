import type { Meta, StoryObj } from "@storybook/react";
import { dataclips } from "../../mock-data/history";
import JsonViewer from "./JsonViewer";

const meta = {
  title: "History/JsonViewer",
  component: JsonViewer,
  decorators: [(Story) => <div className="h-96">{Story()}</div>],
} satisfies Meta<typeof JsonViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HttpRequest: Story = { args: { value: dataclips[0].body } };
export const StepResult: Story = { args: { value: dataclips[1].body } };
export const Empty: Story = { args: { value: {} } };
