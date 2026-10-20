import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, Globe, PenLine, Plug, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChannelType } from "../page-data";
import Badge from "./Badge";
import type { BadgeTone } from "./Badge";
import ListRow from "./ListRow";
import StartWorkflowFromChannel from "./StartWorkflowFromChannel";

/** "default" is the HTTP channel created automatically when a system gets a URL. */
export type ChannelRowType = ChannelType | "default";

const typeConfig: Record<ChannelRowType, { label: string; icon: LucideIcon; tone: BadgeTone }> = {
  write: { label: "Write", icon: PenLine, tone: "green" },
  read: { label: "Read", icon: Eye, tone: "gray" },
  event: { label: "Event", icon: Zap, tone: "purple" },
  default: { label: "Default", icon: Plug, tone: "blue" },
};

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
  const config = channelType ? typeConfig[channelType] : undefined;
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
              <Link to={system.path} className="inline-flex items-center gap-1 hover:text-blue-600">
                <Globe size={11} />
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
