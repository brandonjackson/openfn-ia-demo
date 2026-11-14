import type { Meta, StoryObj } from "@storybook/react";
import WorkflowNodeCard from "./WorkflowNodeCard";
import { hardshipGrantWorkflow, nationalIdWorkflow, registerCaseWorkflow, weeklyCaseReportWorkflow } from "../../fixtures/workflow";
import { runActivity } from "../../model/runs";
import { failedRun, sampleRun, waitingRun, workOrders } from "../../fixtures/runs";
import { adaptorInfo } from "../../fixtures/adaptor-reference";
import { connectedSystems } from "../../fixtures/connected-systems";
import type { WorkflowNode } from "../../model/workflow";

/** A node with what its card names it by: a step's adaptor and, when it has one, its connected system. */
const card = (node: WorkflowNode) =>
  node.type === "job"
    ? {
        node,
        adaptorName: adaptorInfo[node.adaptor].name,
        system: node.system ? connectedSystems.find((s) => s.id === node.system) : undefined,
      }
    : { node };

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger")!;
const httpJob = nationalIdWorkflow.nodes.find((n) => n.id === "search")!;
const createJob = nationalIdWorkflow.nodes.find((n) => n.id === "create")!;
const commonJob = nationalIdWorkflow.nodes.find((n) => n.id === "queue")!;
const activity = runActivity(nationalIdWorkflow, workOrders);

const meta: Meta<typeof WorkflowNodeCard> = {
  title: "Domain/WorkflowNodeCard",
  component: WorkflowNodeCard,
  parameters: { layout: "padded" },
  args: { onAction: () => {}, onOpen: () => {} },
};

export default meta;
type Story = StoryObj<typeof WorkflowNodeCard>;

export const Trigger: Story = { args: { ...card(trigger) } };
export const HttpJob: Story = { args: { ...card(httpJob) } };
export const CommonJob: Story = { args: { ...card(commonJob) } };
export const Selected: Story = { args: { ...card(httpJob), selected: true } };

/** On main the delete item is disabled. */
export const ReadOnly: Story = { args: { ...card(httpJob), readOnly: true } };

/** A step other steps run after: Delete is off in the menu, saying why, as on Lightning. */
export const DeleteBlocked: Story = {
  args: { ...card(httpJob), deleteBlockedReason: "Cannot delete: other jobs depend on this step" },
};

/** Near the canvas's right edge the menu opens under its button instead of beside the card. */
export const MenuBelow: Story = { args: { ...card(commonJob), menuPlacement: "below" } };

/** Without an action handler the card has no menu. */
export const NoMenu: Story = { args: { ...card(httpJob), onAction: undefined } };

/** Hover the card to see the + that adds a step after it. */
export const WithAddStep: Story = { args: { ...card(httpJob), onAddAfter: () => {} } };

/** The run history on the card: runs that reached it and failures there. */
export const WithActivity: Story = { args: { ...card(createJob), activity: activity.nodes.create, onShowFailures: () => {} } };
export const WithActivityNoFailures: Story = { args: { ...card(httpJob), activity: activity.nodes.confirm } };

/** A step from the run shown on the canvas. */
export const RanSuccessfully: Story = {
  args: { ...card(httpJob), step: sampleRun.steps.find((s) => s.jobId === "search") },
};

export const RanAndFailed: Story = {
  args: { ...card(createJob), step: failedRun.steps.find((s) => s.jobId === "create") },
};

export const Running: Story = {
  args: { ...card(httpJob), step: { ...sampleRun.steps[0], status: "running", duration: "" } },
};

/** The trigger of a run says who or what started it. */
export const TriggerThatStartedRun: Story = {
  args: { ...card(trigger), note: `Started by ${sampleRun.startedBy}` },
};

/** The run shown on the canvas never reached this step. */
export const NotReached: Story = { args: { ...card(commonJob), dimmed: true } };

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <WorkflowNodeCard {...card(trigger)} onAction={() => {}} activity={activity.nodes.trigger} />
      <WorkflowNodeCard {...card(httpJob)} onAction={() => {}} activity={activity.nodes.search} onShowFailures={() => {}} />
      <WorkflowNodeCard {...card(createJob)} onAction={() => {}} selected step={failedRun.steps.find((s) => s.jobId === "create")} />
      <WorkflowNodeCard {...card(commonJob)} onAction={() => {}} dimmed />
    </div>
  ),
};

/** Workflow A's step on OpenMRS, reached over X-Road. The card doesn't say how a system is reached. */
export const OnXRoadSystem: Story = { args: { ...card(registerCaseWorkflow.nodes.find((n) => n.id === "openmrs-patient")!) } };

/** Workflow B's step on DHIS2, reached directly. It looks the same as one over X-Road. */
export const OnDirectSystem: Story = { args: { ...card(weeklyCaseReportWorkflow.nodes.find((n) => n.id === "send-dhis2")!) } };

/** A step that needs a credential and has none, in a sandbox: Connect opens its config at the credential. */
export const NeedsCredential: Story = { args: { ...card(httpJob), onConnect: () => {} } };

/** Two steps on different DHIS2 systems: each is named by its system, with DHIS2's logo. */
export const TwoDhis2Systems: Story = {
  render: () => {
    const send = weeklyCaseReportWorkflow.nodes.find((n) => n.id === "send-dhis2")!;
    return (
      <div className="flex gap-4">
        <WorkflowNodeCard {...card(send)} />
        <WorkflowNodeCard {...card({ ...send, id: "send-malaria", label: "Send malaria cases to the programme", system: "dhis2-malaria" } as typeof send)} />
      </div>
    );
  },
};

/** A Report outcome step names its tool and the outcome it records. */
export const ReportOutcome: Story = { args: { ...card(hardshipGrantWorkflow.nodes.find((n) => n.id === "outcome-declined")!) } };

/** A Human in the loop step. */
export const HumanInTheLoop: Story = { args: { ...card(hardshipGrantWorkflow.nodes.find((n) => n.id === "approve-grant")!) } };

/** A loaded run waiting on someone to approve it. */
export const WaitingOnSomeone: Story = {
  args: { ...card(hardshipGrantWorkflow.nodes.find((n) => n.id === "approve-grant")!), step: waitingRun.steps.at(-1) },
};
