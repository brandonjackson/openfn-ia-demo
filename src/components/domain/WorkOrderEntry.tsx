import { Ban, RotateCcw } from "lucide-react";
import type { HistoryWorkOrder } from "../../model/history";
import type { RunDetails, RunStep } from "../../model/workflow";
import ExpandableRow from "../primitives/ExpandableRow";
import Checkbox from "../primitives/Checkbox";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import IconButton from "../primitives/IconButton";
import StatusPill from "./StatusPill";
import RunEntry from "./RunEntry";
import OutcomeBadge from "./OutcomeBadge";
import type { ApprovalDecision } from "../../model/step-tools";

interface Props {
  order: HistoryWorkOrder;
  /** Says which project the order belongs to, in History across every project. */
  showProject?: boolean;
  /** The workflow's latest version, to tag runs on an older one. */
  latestVersion?: string;
  selected: boolean;
  onSelectChange: (selected: boolean) => void;
  expanded: boolean;
  onToggle: () => void;
  /** Runs the order again from the start. Left out where you can't run the workflow. */
  onRetry?: () => void;
  /** Cancels the order while it's still waiting to run. */
  onCancel?: () => void;
  /** Opens one of its runs in the editor. */
  onInspectRun?: (run: RunDetails) => void;
  /** Runs the order again from one of a run's steps. */
  onRetryFromStep?: (run: RunDetails, step: RunStep) => void;
  /** Answers a run waiting on a Human in the loop step; resolves once it has carried on. Left out where you can't. */
  onAnswer?: (run: RunDetails, decision: ApprovalDecision, comment: string) => Promise<void>;
}

/**
 * A work order in History: the workflow that received it, its id, when it
 * came in and with what, and the status of its latest run, beside the
 * business outcome it reported, if any (a refusal sent without a hitch is a
 * successful run with a Rejected outcome). Opening it shows every run made
 * for it, newest first.
 */
export default function WorkOrderEntry({
  order,
  showProject = false,
  latestVersion,
  selected,
  onSelectChange,
  expanded,
  onToggle,
  onRetry,
  onCancel,
  onInspectRun,
  onRetryFromStep,
  onAnswer,
}: Props) {
  const { workOrder, input } = order;
  const runCount = workOrder.runs.length;
  const pending = workOrder.status === "pending";
  const finished = !pending && workOrder.status !== "running" && workOrder.status !== "waiting";
  const where = showProject ? `${order.projectName} · ` : "";

  return (
    <ExpandableRow
      label={`Work order ${workOrder.id}, ${workOrder.status}`}
      expanded={expanded}
      onToggle={onToggle}
      selected={selected}
      leading={
        <Checkbox
          label={`Select work order ${workOrder.id}`}
          hideLabel
          checked={selected}
          onChange={onSelectChange}
        />
      }
      trailing={
        <>
          {pending && onCancel && (
            <IconButton
              size="sm"
              icon={Ban}
              label={`Cancel work order ${workOrder.id}`}
              hint="Cancel"
              onClick={onCancel}
            />
          )}
          {finished && onRetry && (
            <IconButton
              size="sm"
              icon={RotateCcw}
              label={`Retry work order ${workOrder.id}`}
              hint="Retry from the start"
              onClick={onRetry}
            />
          )}
        </>
      }
      details={
        <Stack gap="sm">
          {workOrder.runs.map((run) => (
            <RunEntry
              key={run.runId}
              run={run}
              latestVersion={latestVersion}
              onInspect={onInspectRun}
              onRetryFromStep={onRetryFromStep}
              onCancel={onCancel ? () => onCancel() : undefined}
              onAnswer={onAnswer}
            />
          ))}
        </Stack>
      }
    >
      <Inline justify="between" gap="md" stackOnMobile>
        <Inline grow>
          <Stack gap="none">
            <Inline>
              <Text tone="strong" truncate>
                {order.workflowName}
              </Text>
              <Text tone="subtle" mono size="xs">
                {workOrder.id}
              </Text>
            </Inline>
            <Text tone="muted" size="xs" truncate>
              {`${where}Received ${order.receivedAt} · input ${input.name ?? input.id}`}
            </Text>
          </Stack>
        </Inline>
        <Inline>
          <Text tone="muted" size="xs" nowrap>
            {runCount === 1
              ? workOrder.lastActivity
              : `${runCount} runs · ${workOrder.lastActivity}`}
          </Text>
          {workOrder.outcome && <OutcomeBadge status={workOrder.outcome.status} />}
          <StatusPill status={workOrder.status} />
        </Inline>
      </Inline>
    </ExpandableRow>
  );
}
