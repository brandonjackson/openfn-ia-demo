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

/** Editing one the assistant wrote from the spec: a saved dataclip as its input and deterministic tests, no judgement. */
export const Editing: Story = { args: { initial: draftOf(nationalIdTestCaseRecords[0]!) } };

/** Saving takes a moment: the button says so and ignores a second press. */
export const Saving: Story = { args: { onSubmit: () => new Promise(() => {}) } };

/** An end step the start can't reach, refused by the server, shows under the field. */
export const EndUnreachable: Story = {
  args: { onSubmit: () => Promise.reject(new FormError("Not saved", { end_job_id: ["can't be reached from the start step"] })) },
};
