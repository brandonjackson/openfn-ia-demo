import { ArrowLeftRight, Workflow } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ChannelPageData } from "../model/page-data";
import { channelTypeConfig } from "../components/domain/channel-types";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import ChannelView from "../components/domain/ChannelView";

export interface ChannelPageProps extends PageProps<ChannelPageData> {
  /** Opens the workflow whose runs the channel's messages started or came from, when there is one. */
  onOpenWorkflow?: () => void;
  /** Opens that workflow with a run loaded, from one of the channel's messages. */
  onOpenRun?: (runId: string) => void;
}

/**
 * A channel's page in its project, opened from the project's Components: the
 * same `ChannelView` the workflow editor shows when the channel is opened from
 * its code explorer, under the page's header. Loading a run from a message
 * opens the workflow editor with that run loaded.
 */
export default function ChannelPage({ ancestors, data, onOpenWorkflow, onOpenRun }: ChannelPageProps) {
  const { component, channel } = data;
  const type = channelTypeConfig[channel.channelType];

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={component.name} />}
        icon={ArrowLeftRight}
        title={component.name}
        badges={<Badge label={type.label} tone={type.tone} icon={type.icon} />}
        description={component.description}
        actions={
          onOpenWorkflow && (
            <Button icon={Workflow} size="sm" variant="secondary" onClick={onOpenWorkflow}>
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
        onOpenRun={onOpenRun}
      />
    </div>
  );
}
