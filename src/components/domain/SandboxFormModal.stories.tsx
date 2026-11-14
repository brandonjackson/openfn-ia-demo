import type { Meta, StoryObj } from "@storybook/react";
import SandboxFormModal from "./SandboxFormModal";
import { dataclips, olderRun, sampleRun } from "../../fixtures/runs";
import { projects } from "../../fixtures/projects";

const sandboxes = projects[0].sandboxes;
const inputOf = (inputId: string) => dataclips.find((d) => d.id === inputId)?.body;

const meta: Meta<typeof SandboxFormModal> = {
  title: "Domain/SandboxFormModal",
  component: SandboxFormModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, sandboxes, onClose: () => {}, onSubmit: async () => {} },
};
export default meta;
type Story = StoryObj<typeof SandboxFormModal>;

/** New sandbox, from the Sandboxes page or the sandbox chip: a name, its environment and what to make it from. */
export const New: Story = {};

/** Editing one: its name and environment. */
export const Edit: Story = { args: { sandbox: { name: sandboxes[1]!, env: "staging" } } };

/** "Edit in sandbox" in the editor with no run loaded: the same form under its own heading. */
export const EditInSandbox: Story = { args: { title: "Edit in sandbox", latestVersion: "v2" } };

/** "Edit in sandbox" with a run loaded: it can start with a copy of the run's input, checked first. */
export const EditInSandboxFromRun: Story = {
  args: { title: "Edit in sandbox", latestVersion: "v2", run: { runId: sampleRun.runId, version: sampleRun.version, input: inputOf(sampleRun.inputId) } },
};

/** A run on an older version: the sandbox still starts from the latest. */
export const FromOlderRun: Story = {
  args: { title: "Edit in sandbox", latestVersion: "v2", run: { runId: olderRun.runId, version: olderRun.version, input: inputOf(olderRun.inputId) } },
};

/** A run whose input wasn't kept: there's nothing to copy, and it says so. */
export const RunInputNotKept: Story = { args: { title: "Edit in sandbox", run: { runId: sampleRun.runId, version: sampleRun.version } } };

/** The server refused the name: the reason shows under it. */
export const Refused: Story = { args: { onSubmit: () => Promise.reject(new Error("There's already a sandbox called fix-intake.")) } };
