import Link from "../primitives/Link";
import { ArrowUpRight, Globe } from "lucide-react";
import AdaptorLogo from "./AdaptorLogo";
import { channelTypeConfig } from "./channel-types";
import type { ChannelRowType } from "./channel-types";
import Badge from "../primitives/Badge";
import ListRow from "../primitives/ListRow";
import StartWorkflowFromChannel from "./StartWorkflowFromChannel";

export type { ChannelRowType };

interface Props {
  /** Service catalog ID, used when starting a workflow from an event channel. */
  id: string;
  name: string;
  description: string;
  channelType?: ChannelRowType;
  /** Marks a channel the platform created rather than a person. */
  autoCreated?: boolean;
  /** The system that publishes the channel, shown as a link under the description. */
  system?: { name: string; path: string };
}

/**
 * A read, write or event channel published by a connected system. Event
 * channels offer to start a new workflow from them.
 */
export default function ChannelRow({ id, name, description, channelType, autoCreated = false, system }: Props) {
  const config = channelType ? channelTypeConfig[channelType] : undefined;
  const showMeta = system || channelType === "event";

  return (
    <ListRow
      icon={config?.icon ?? Globe}
      title={name}
      badges={
        (config || autoCreated) && (
          <>
            {config && <Badge label={config.label} tone={config.tone} />}
            {autoCreated && <Badge label="Auto-created" />}
          </>
        )
      }
      description={description}
      meta={
        showMeta && (
          <>
            {system && (
              <Link to={system.path} className="inline-flex items-center gap-1 hover:text-indigo-600">
                <AdaptorLogo name={system.name} size="2xs" />
                {system.name}
                <ArrowUpRight size={10} />
              </Link>
            )}
            {channelType === "event" && <StartWorkflowFromChannel channelId={id} />}
          </>
        )
      }
    />
  );
}
