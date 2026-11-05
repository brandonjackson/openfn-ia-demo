import { Trash2, Workflow } from "lucide-react";
import type { WorkflowListItem } from "../../model/page-data";
import { triggerTypes } from "../../model/workflow";
import ActionMenu from "../primitives/ActionMenu";
import AvatarStack from "../primitives/AvatarStack";
import Badge from "../primitives/Badge";
import Inline from "../primitives/Inline";
import ListRow from "../primitives/ListRow";
import Text from "../primitives/Text";
import ToggleSwitch from "../primitives/ToggleSwitch";
import StatusPill from "./StatusPill";

const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});
const countFormat = new Intl.NumberFormat("en-US");

/** What the switch means, in Lightning's words. */
function stateTooltip(workflow: WorkflowListItem): string {
  if (!workflow.triggerType) return "This workflow is inactive (no triggers configured)";
  if (!workflow.enabled) return "This workflow is inactive (manual runs only)";
  return `This workflow is active (${triggerTypes[workflow.triggerType].shortLabel.toLowerCase()} trigger enabled)`;
}

interface Props {
  workflow: WorkflowListItem;
  /** Turns its triggers on or off. Left out, there's no switch. */
  onToggleEnabled?: (enabled: boolean) => void;
  /** Asks to delete it. Left out, there's no ⋮ menu. */
  onDelete?: () => void;
}

/**
 * A workflow on a project's Workflows list: its name and description, the
 * status of the service it backs, when it last ran and changed, then its
 * latest run, its work orders and failures over the last 30 days, and the
 * people who edit it. A switch turns its triggers on and off, and a ⋮ deletes
 * it. Opening it goes to the editor.
 */
export default function WorkflowRow({ workflow, onToggleEnabled, onDelete }: Props) {
  const hasActions = Boolean(onToggleEnabled || onDelete);
  return (
    <ListRow
      to={`/workflow-editor/${workflow.id}`}
      icon={Workflow}
      title={workflow.name}
      badges={
        (workflow.serviceStatus || !workflow.enabled) && (
          <>
            {workflow.serviceStatus && <Badge label={workflow.serviceStatus} />}
            {!workflow.enabled && <Badge label="Off" />}
          </>
        )
      }
      description={workflow.description}
      meta={
        <>
          {workflow.lastRunAt && <span>Last run {timeFormat.format(new Date(workflow.lastRunAt))}</span>}
          <span>Updated {timeFormat.format(new Date(workflow.updatedAt))}</span>
        </>
      }
      columns={[
        {
          label: "Latest run",
          value: workflow.latestRun ? <StatusPill status={workflow.latestRun} /> : <Text tone="subtle">Never run</Text>,
        },
        { label: "Work orders", value: countFormat.format(workflow.workOrders) },
        {
          label: "Failed",
          value: <Text tone={workflow.failedWorkOrders > 0 ? "danger" : "subtle"}>{countFormat.format(workflow.failedWorkOrders)}</Text>,
          width: "sm",
        },
        { label: "Members", value: <AvatarStack names={workflow.members} />, width: "lg" },
      ]}
      actions={
        hasActions && (
          <Inline gap="sm">
            {onToggleEnabled && (
              <ToggleSwitch
                checked={workflow.enabled}
                label={`${workflow.name} enabled`}
                hideLabel
                title={stateTooltip(workflow)}
                disabled={!workflow.triggerType}
                onChange={onToggleEnabled}
              />
            )}
            {onDelete && (
              <ActionMenu
                label={`Actions for ${workflow.name}`}
                items={[{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" }]}
                onSelect={() => onDelete()}
              />
            )}
          </Inline>
        )
      }
    />
  );
}
