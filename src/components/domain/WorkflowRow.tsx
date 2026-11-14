import { Copy, Send, Trash2, Workflow } from "lucide-react";
import type { WorkflowListItem } from "../../model/workflow-list";
import { triggerTypes } from "../../model/workflow";
import AvatarStack from "../primitives/AvatarStack";
import Badge from "../primitives/Badge";
import ListRow from "../primitives/ListRow";
import type { ListRowMenu } from "../primitives/ListRow";
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
  /** Makes a copy of it. Left out, its ⋮ menu has no Make a copy. */
  onCopy?: () => void;
  /** Publishes it as a service. Left out (it's published already, or the catalog is off), its ⋮ menu has no Publish. */
  onPublish?: () => void;
  /** Asks to delete it. Left out, its ⋮ menu has no Delete. */
  onDelete?: () => void;
  /** More actions for its ⋮ menu, after Publish and before Delete. */
  menu?: ListRowMenu;
}

/**
 * A workflow on a project's Workflows list: its name and description, a
 * Live or Paused pill that says what its switch says, when it last ran and
 * changed, then its latest run, its work orders and failures over the last 30
 * days, and the people who edit it. A switch turns its triggers on and off,
 * and its ⋮ menu opens, copies, publishes or deletes it. Opening it goes to
 * the editor.
 */
export default function WorkflowRow({ workflow, onToggleEnabled, onCopy, onPublish, onDelete, menu }: Props) {
  const own = [
    ...(onCopy ? [{ id: "copy", label: "Make a copy", icon: Copy }] : []),
    ...(onPublish ? [{ id: "publish", label: "Publish", icon: Send }] : []),
    ...(menu?.items ?? []),
  ];
  return (
    <ListRow
      to={`/workflow-editor/${workflow.id}`}
      icon={Workflow}
      title={workflow.name}
      badges={workflow.enabled ? <Badge label="Live" tone="green" /> : <Badge label="Paused" tone="gray" />}
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
        ...(workflow.members ? [{ label: "Members", value: <AvatarStack names={workflow.members} />, width: "lg" as const }] : []),
      ]}
      actions={
        onToggleEnabled && (
          <ToggleSwitch
            checked={workflow.enabled}
            label={`${workflow.name} enabled`}
            hideLabel
            title={stateTooltip(workflow)}
            disabled={!workflow.triggerType}
            onChange={onToggleEnabled}
          />
        )
      }
      menu={{
        items: [...own, ...(onDelete ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: own.length > 0 }] : [])],
        onSelect: (id) => {
          if (id === "delete") onDelete?.();
          else if (id === "copy") onCopy?.();
          else if (id === "publish") onPublish?.();
          else menu?.onSelect?.(id);
        },
      }}
    />
  );
}
