import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Workflow } from "lucide-react";
import type { IANode } from "../model/ia-tree";
import type { ChannelPageData } from "../model/page-data";
import { channelTypeConfig } from "../model/channel-types";
import PageHeader from "../components/patterns/PageHeader";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import ChannelView from "../components/patterns/ChannelView";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ChannelPageData;
}

/**
 * A channel's page in its project, opened from the project's Components: the
 * same `ChannelView` the workflow editor shows when the channel is opened from
 * its code explorer, under the page's header. Loading a run from a message
 * opens the workflow editor with that run loaded.
 */
export default function ChannelPage({ ancestors, data }: Props) {
  const navigate = useNavigate();
  const { component, channel } = data;
  const type = channelTypeConfig[channel.channelType];
  const workflowPath = channel.workflowId ? `/workflow-editor/${channel.workflowId}` : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: component.name,
        }}
        icon={ArrowLeftRight}
        title={component.name}
        badges={<Badge label={type.label} tone={type.tone} icon={type.icon} />}
        description={component.description}
        actions={
          workflowPath && (
            <Button icon={Workflow} size="sm" variant="secondary" onClick={() => navigate(workflowPath)}>
              Open workflow
            </Button>
          )
        }
      />
      <ChannelView
        variant="page"
        name={component.name}
        description={component.description}
        channel={channel}
        onOpenRun={workflowPath ? (runId) => navigate(`${workflowPath}?run=${runId}`) : undefined}
      />
    </div>
  );
}
