import type { Meta, StoryObj } from "@storybook/react";
import SavedDataclipsView from "./SavedDataclipsView";
import { dataclips } from "../../fixtures/runs";
import { savedDataclips } from "../../model/dataclips";
import { FormError } from "../../model/form-error";

const saved = savedDataclips(dataclips);

const meta: Meta<typeof SavedDataclipsView> = {
  title: "Domain/SavedDataclipsView",
  component: SavedDataclipsView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 640 }}>
        <Story />
      </div>
    ),
  ],
  args: { dataclips: saved, onRun: () => {}, onSave: async () => {}, onCreate: () => {} },
};

export default meta;
type Story = StoryObj<typeof SavedDataclipsView>;

/** The project's saved dataclips, each with Run as its main action and a pencil to edit its title and description. */
export const Default: Story = {};

/** One brought into a sandbox from a run, beside the project's own. */
export const BroughtIntoSandbox: Story = {
  args: {
    dataclips: [{ id: "a1b2c3d4", name: "Input from run afa317bf", type: "saved_input", created: "just now", body: saved[1]!.body }, ...saved],
  },
};

/** Nothing saved yet. */
export const Empty: Story = { args: { dataclips: [] } };

/** Where you can only run them: no editing and no new ones. */
export const RunOnly: Story = { args: { onSave: undefined, onCreate: undefined } };

/** A rename the server refuses shows under the title (press the pencil, then Save). */
export const RefusedRename: Story = {
  args: { onSave: () => Promise.reject(new FormError("Not saved", { name: ["has already been taken"] })) },
};
