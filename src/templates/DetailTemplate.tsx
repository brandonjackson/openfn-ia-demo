import { Link } from "react-router-dom";
import { Eye, PenLine, Zap, Users, Lock, Globe, ArrowRight } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { DetailPageData, DetailSectionItem } from "../page-data";
import type { ChannelType } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: DetailPageData;
}

const channelTypeConfig: Record<
  string,
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

function ChannelCard({ item }: { item: DetailSectionItem }) {
  const channelType = item.metadata?.channelType as ChannelType | undefined;
  const config = channelType ? channelTypeConfig[channelType] : null;
  const Icon = config?.icon ?? Globe;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className={config?.iconColor ?? "text-gray-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
          {config && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.badge}`}
            >
              {config.label}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
        {channelType === "event" && (
          <Link
            to="/projects"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Create a workflow here
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function DetailTemplate({ node, ancestors, data }: Props) {
  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <Globe size={22} className="text-gray-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
            {data.headerBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  data.headerBadge.variant === "shared"
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-gray-100 border-gray-200 text-gray-500"
                }`}
              >
                {data.headerBadge.variant === "shared" ? (
                  <Users size={10} />
                ) : (
                  <Lock size={10} />
                )}
                {data.headerBadge.label}
              </span>
            )}
          </div>
          {node.description && (
            <p className="mt-1 text-sm text-gray-500">{node.description}</p>
          )}
        </div>
      </div>

      {data.sections.map((section) => (
        <div key={section.id} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
            <span className="text-xs text-gray-400">
              {section.items.length} {section.title.toLowerCase()}
            </span>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <ChannelCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
