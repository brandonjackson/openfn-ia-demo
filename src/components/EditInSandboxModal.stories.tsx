import type { Meta, StoryObj } from "@storybook/react";
import EditInSandboxModal from "./EditInSandboxModal";
import { dataclips, olderRun, sampleRun } from "../mock-data/runs";
import { projects } from "../mock-data/projects";

const inputOf = (runInputId: string) => dataclips.find((d) => d.id === runInputId);

const meta: Meta<typeof EditInSandboxModal> = {
  title: "Components/EditInSandboxModal",
  component: EditInSandboxModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: () => {},
    onCreate: () => {},
    onJoin: () => {},
    sandboxes: projects[0].sandboxes.filter((s) => s !== "main"),
    latestVersion: "v2",
    dataclips,
  },
};

export default meta;
type Story = StoryObj<typeof EditInSandboxModal>;

/** No run selected: start empty or from a saved input. */
export const Default: Story = {};

/** Following a run: its input is offered, and chosen by default. */
export const FromRun: Story = {
  args: { run: sampleRun, runInput: inputOf(sampleRun.inputId) },
};

/** Picking one of the project's named inputs. */
export const FromSavedInput: Story = {
  args: { defaultChoice: "saved" },
};

/** A run on an older version: the sandbox still starts from the latest. */
export const FromOlderRun: Story = {
  args: { run: olderRun, runInput: inputOf(olderRun.inputId) },
};

/** The run's input wasn't kept, so there's nothing to copy. */
export const RunInputNotKept: Story = {
  args: { run: sampleRun, runInput: undefined },
};

/** Reviewing a copy of the run's input before it leaves main. */
export const Review: Story = {
  args: {
    run: sampleRun,
    runInput: inputOf(sampleRun.inputId),
    defaultStep: "review",
    defaultName: "try-district-codes",
  },
};

/** No other sandboxes yet, so there's nothing to join. */
export const NoSandboxesToJoin: Story = { args: { sandboxes: [] } };
