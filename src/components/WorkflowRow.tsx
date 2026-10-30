import type { ReactNode } from "react";
import { Workflow } from "lucide-react";
import type { WorkflowListItem } from "../page-data";
import ListRow from "./ListRow";
import Badge from "./Badge";
import AvatarStack from "./AvatarStack";
import StatusPill from "./workflow/StatusPill";

const updatedFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

function Column({ label, width, children }: { label: string; width: string; children: ReactNode }) {
  return (
    <div className={`hidden flex-shrink-0 md:block ${width}`}>
      <div className="mb-1.5 text-xs font-medium text-gray-500">{label}</div>
      <div className="flex h-6 items-center text-sm text-gray-600">{children}</div>
    </div>
  );
}

interface Props {
  workflow: WorkflowListItem;
}

/**
 * A workflow on a project's Workflows list: its name and description, the
 * status of the service it backs, then its latest run, the people who edit
 * it and when it last changed. Opening it goes to the editor.
 */
export default function WorkflowRow({ workflow }: Props) {
  return (
    <ListRow
      to={`/workflow-editor/${workflow.id}`}
      icon={Workflow}
      title={workflow.name}
      badges={workflow.serviceStatus && <Badge label={workflow.serviceStatus} />}
      description={workflow.description}
      trailing={
        <div className="flex items-start gap-6">
          <Column label="Latest run" width="w-24">
            {workflow.latestRun ? (
              <StatusPill status={workflow.latestRun} />
            ) : (
              <span className="text-gray-400">Never run</span>
            )}
          </Column>
          <Column label="Members" width="w-36">
            <AvatarStack names={workflow.members} />
          </Column>
          <Column label="Last updated" width="w-32">
            <span className="whitespace-nowrap">{updatedFormat.format(new Date(workflow.updatedAt))}</span>
          </Column>
        </div>
      }
    />
  );
}
