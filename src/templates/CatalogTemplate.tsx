import { Link } from "react-router-dom";
import {
  Eye,
  PenLine,
  Zap,
  Globe,
  ArrowRight,
  ArrowUpRight,
  Workflow,
} from "lucide-react";
import type { IANode } from "../ia-tree";
import type {
  CatalogPageData,
  CatalogEntry,
  ChannelCatalogEntry,
  WorkflowCatalogEntry,
  ChannelType,
} from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import Badge from "../components/Badge";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: CatalogPageData;
}

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

function ChannelCatalogCard({ entry }: { entry: ChannelCatalogEntry }) {
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
          {entry.channelType === "event" && (
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Create a workflow here
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowCatalogCard({ entry }: { entry: WorkflowCatalogEntry }) {
  return (
    <Link
      to={entry.projectPath}
      className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Workflow size={16} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
            {entry.name}
          </span>
          {entry.badges?.map((b) => <Badge key={b} label={b} />)}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{entry.description}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <Workflow size={11} />
          {entry.project}
          <ArrowUpRight size={10} />
        </div>
      </div>
    </Link>
  );
}

export default function CatalogTemplate({ node, ancestors, data }: Props) {
  const bySection = new Map<string, CatalogEntry[]>();
  for (const entry of data.entries) {
    const list = bySection.get(entry.section) ?? [];
    list.push(entry);
    bySection.set(entry.section, list);
  }

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && (
          <p className="mt-1 text-sm text-gray-500">{node.description}</p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {data.entries.length} services published across the organization
      </p>

      {[...bySection.entries()].map(([section, entries]) => (
        <div key={section} className="mt-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{section}</h2>
          <div className="space-y-2">
            {entries.map((entry) =>
              entry.kind === "channel" ? (
                <ChannelCatalogCard key={entry.id} entry={entry} />
              ) : (
                <WorkflowCatalogCard key={entry.id} entry={entry} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
