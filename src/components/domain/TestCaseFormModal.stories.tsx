import type { Meta, StoryObj } from "@storybook/react";
import TestCaseFormModal from "./TestCaseFormModal";
import { nationalIdTestCaseRecords } from "../../fixtures/test-cases";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import { dataclips } from "../../fixtures/runs";
import { savedDataclips } from "../../model/dataclips";
import { draftOf } from "../../model/test-cases";
import { FormError } from "../../model/form-error";

const steps = nationalIdWorkflow.nodes.flatMap((n) => (n.type === "job" ? [{ id: n.id, label: n.label }] : []));
const saved = savedDataclips(dataclips).map((d) => ({ id: d.id, name: d.name! }));

const meta: Meta<typeof TestCaseFormModal> = {
  title: "Domain/TestCaseFormModal",
  component: TestCaseFormModal,
  args: { open: true, onClose: () => {}, onSubmit: async () => {}, defaultName: "Untitled test", steps, dataclips: saved },
};

export default meta;
type Story = StoryObj<typeof TestCaseFormModal>;

/** A new test case: the assistant makes the input from its description and judges the output against its own. */
export const Default: Story = {};

/** Written by hand with its input attached as JSON and the output it expects, which the run is compared with as well as judged. */
export const AttachedInputAndOutput: Story = {
  args: { initial: draftOf(nationalIdTestCaseRecords.find((t) => t.input.kind === "attached")!) },
};

/** Without a saved dataclip, an input is still attached or generated. */
export const NoSavedDataclips: Story = { args: { dataclips: [] } };

/** Editing one the assistant wrote from the spec: a saved dataclip as its input and deterministic tests, no judgement. */
export const Editing: Story = { args: { initial: draftOf(nationalIdTestCaseRecords[0]!) } };

/** Saving takes a moment: the button says so and ignores a second press. */
export const Saving: Story = { args: { onSubmit: () => new Promise(() => {}) } };

/** An attached input the server refuses, e.g. one too big to keep, is said under its field. */
export const AttachedInputRefused: Story = {
  args: {
    initial: draftOf(nationalIdTestCaseRecords.find((t) => t.input.kind === "attached")!),
    onSubmit: () => Promise.reject(new FormError("Not saved", { input_body: ["should be at most 100000 character(s)"] })),
  },
};

/** An end step the start can't reach, refused by the server, shows under the field. */
export const EndUnreachable: Story = {
  args: { onSubmit: () => Promise.reject(new FormError("Not saved", { end_job_id: ["can't be reached from the start step"] })) },
};
