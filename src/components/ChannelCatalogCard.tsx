import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, Globe, PenLine, Zap } from "lucide-react";
import type { ChannelCatalogEntry, ChannelType } from "../page-data";
import StartWorkflowFromChannel from "./StartWorkflowFromChannel";

const channelTypeConfig: Record<
  ChannelType,
  { label: string; icon: React.ElementType; badge: string; iconColor: string }
> = {
  write: {
    label: "Write",
    icon: PenLine,
    badge: "bg-green-50 text-green-700 border-green-200",
    iconColor: "text-green-500",
  },
  read: {
    label: "Read",
    icon: Eye,
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    iconColor: "text-gray-400",
  },
  event: {
    label: "Event",
    icon: Zap,
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    iconColor: "text-purple-500",
  },
};

interface Props {
  entry: ChannelCatalogEntry;
}

/** A connected system's channel in the catalog: read, write or event. */
export default function ChannelCatalogCard({ entry }: Props) {
  const config = channelTypeConfig[entry.channelType];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className={config.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{entry.name}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.badge}`}
          >
            {config.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{entry.description}</p>
        <div className="mt-2 flex items-center gap-3">
          <Link
            to={entry.systemPath}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600"
          >
            <Globe size={11} />
            {entry.system}
            <ArrowUpRight size={10} />
          </Link>
          {entry.channelType === "event" && <StartWorkflowFromChannel channelId={entry.id} />}
        </div>
      </div>
    </div>
  );
}
