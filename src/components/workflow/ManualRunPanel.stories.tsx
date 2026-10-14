import type { Meta, StoryObj } from "@storybook/react";
import { dataclips } from "../../mock-data/history";
import ManualRunPanel from "./ManualRunPanel";

const meta: Meta<typeof ManualRunPanel> = {
  title: "Workflow/ManualRunPanel",
  component: ManualRunPanel,
  decorators: [(Story) => <div className="bg-gray-100 h-[700px] flex justify-end"><Story /></div>],
  args: {
    title: "Run from Transform data to FHIR standard",
    dataclips: dataclips.filter((d) => d.projectId === "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa"),
    onClose: () => {},
    onRun: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ManualRunPanel>;

export const Standalone: Story = {};
export const CustomInput: Story = { args: { title: "Pick a custom input", initialTab: "custom" } };
export const FromEdge: Story = { args: { title: "Run Workflow", fromEdge: true } };
export const Embedded: Story = {
  args: { mode: "embedded", onClosePanel: () => {} },
  decorators: [(Story) => <div className="w-[420px] h-full bg-white"><Story /></div>],
};
