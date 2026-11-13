import type { Meta, StoryObj } from "@storybook/react";
import TestCasesView from "./TestCasesView";
import { nationalIdTestCaseRecords } from "../../fixtures/test-cases";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import type { TestResult } from "../../model/test-cases";

const steps = nationalIdWorkflow.nodes.flatMap((n) => (n.type === "job" ? [{ id: n.id, label: n.label }] : []));
const passed = (): Promise<TestResult> =>
  new Promise((resolve) => setTimeout(() => resolve({ ...nationalIdTestCaseRecords[0]!.lastResult!, ranAt: "just now" }), 800));

const meta: Meta<typeof TestCasesView> = {
  title: "Domain/TestCasesView",
  component: TestCasesView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 760 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    tests: nationalIdTestCaseRecords,
    steps,
    onRun: passed,
    onCreate: () => {},
    onEdit: () => {},
    onDelete: async () => {},
    onGenerate: () => new Promise((resolve) => setTimeout(() => resolve({ created: 1, names: ["Logs never pair a name with a date of birth"], upToDate: 3, notInSpec: 0 }), 900)),
  },
};

export default meta;
type Story = StoryObj<typeof TestCasesView>;

/** A workflow's tests: three the assistant wrote from the spec and one written by hand that fails. Run all tests sits at the top; each runs alone too. */
export const Default: Story = {};

/** Tests running: each shows it, and keeps its Run pressed until it's done. */
export const Running: Story = { args: { defaultRunning: [nationalIdTestCaseRecords[1]!.id, nationalIdTestCaseRecords[3]!.id] } };

/** A generated test whose requirement has gone from the spec says so. */
export const NotInSpec: Story = {
  args: { tests: [{ ...nationalIdTestCaseRecords[2]!, inSpec: false, requirement: "Act 1098, s. 14: tell the applicant within 10 working days" }] },
};

/** Nothing yet: describe one, or have the assistant write them from the spec. */
export const Empty: Story = { args: { tests: [] } };

/** On main the workflow is read-only: tests run, but can't be written, changed or generated. */
export const ReadOnly: Story = { args: { onCreate: undefined, onEdit: undefined, onDelete: undefined, onGenerate: undefined } };

/** A test that can't run says why under its name. */
export const RunRefused: Story = { args: { onRun: () => Promise.reject(new Error("You can't run tests in this project.")) } };

/** A test written by hand with its input and expected output attached: the input shows as saved, and the comparison is one of its checks. */
export const AttachedInputAndOutput: Story = { args: { tests: nationalIdTestCaseRecords.filter((t) => t.input.kind === "attached") } };
