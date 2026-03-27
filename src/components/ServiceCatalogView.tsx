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
import Breadcrumbs from "./Breadcrumbs";
import Badge from "./Badge";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
}

/* ------------------------------------------------------------------ */
/*  Catalog entry types                                                */
/* ------------------------------------------------------------------ */

type ChannelType = "read" | "write" | "event";

interface ChannelEntry {
  kind: "channel";
  id: string;
  name: string;
  description: string;
  channelType: ChannelType;
  system: string;
  systemPath: string;
}

interface WorkflowEntry {
  kind: "workflow";
  id: string;
  name: string;
  description: string;
  project: string;
  projectPath: string;
  badges?: string[];
}

type CatalogEntry = ChannelEntry | WorkflowEntry;

/* ------------------------------------------------------------------ */
/*  Mock data — aggregated from connected systems + projects           */
/* ------------------------------------------------------------------ */

const catalogEntries: CatalogEntry[] = [
  // OpenCRVS channels (pointers — source of truth is /connected-systems/opencrvs)
  {
    kind: "channel",
    id: "opencrvs-notify-birth",
    name: "Notify a birth",
    description: "Submit a birth notification from a health facility.",
    channelType: "write",
    system: "OpenCRVS",
    systemPath: "/connected-systems/opencrvs",
  },
  {
    kind: "channel",
    id: "opencrvs-birth-registered",
    name: "Birth registered",
    description: "Fires when a birth is officially registered.",
    channelType: "event",
    system: "OpenCRVS",
    systemPath: "/connected-systems/opencrvs",
  },
  {
    kind: "channel",
    id: "opencrvs-search-birth",
    name: "Search for a birth record",
    description: "Look up births by name, date, location, or ID.",
    channelType: "read",
    system: "OpenCRVS",
    systemPath: "/connected-systems/opencrvs",
  },
  {
    kind: "channel",
    id: "opencrvs-notify-death",
    name: "Notify a death",
    description: "Submit a death notification from a health facility.",
    channelType: "write",
    system: "OpenCRVS",
    systemPath: "/connected-systems/opencrvs",
  },
  {
    kind: "channel",
    id: "opencrvs-death-registered",
    name: "Death registered",
    description: "Fires when a death is officially registered.",
    channelType: "event",
    system: "OpenCRVS",
    systemPath: "/connected-systems/opencrvs",
  },
  {
    kind: "channel",
    id: "opencrvs-search-death",
    name: "Search for a death record",
    description: "Look up deaths by name, date, location, or ID.",
    channelType: "read",
    system: "OpenCRVS",
    systemPath: "/connected-systems/opencrvs",
  },

  // Workflow endpoints published from projects
  {
    kind: "workflow",
    id: "project-a-service-live",
    name: "Project A — Service",
    description: "The live, published version of Project A's service.",
    project: "Project A",
    projectPath: "/projects/project-a/service-live",
    badges: ["Live"],
  },
];

/* ------------------------------------------------------------------ */
/*  Channel type styling                                               */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Cards                                                              */
/* ------------------------------------------------------------------ */

function ChannelCatalogCard({ entry }: { entry: ChannelEntry }) {
  const config = channelTypeConfig[entry.channelType];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className={config.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">
            {entry.name}
          </span>
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

function WorkflowCatalogCard({ entry }: { entry: WorkflowEntry }) {
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

/* ------------------------------------------------------------------ */
/*  Main view                                                          */
/* ------------------------------------------------------------------ */

export default function ServiceCatalogView({
  node,
  ancestors,
}: Props) {
  const channelEntries = catalogEntries.filter(
    (e): e is ChannelEntry => e.kind === "channel"
  );
  const workflowEntries = catalogEntries.filter(
    (e): e is WorkflowEntry => e.kind === "workflow"
  );

  // Group channels by system
  const channelsBySystem = new Map<string, ChannelEntry[]>();
  for (const ch of channelEntries) {
    const list = channelsBySystem.get(ch.system) ?? [];
    list.push(ch);
    channelsBySystem.set(ch.system, list);
  }

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({
          label: a.node.label,
          path: a.path,
        }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && (
          <p className="mt-1 text-sm text-gray-500">{node.description}</p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {catalogEntries.length} services published across the organization
      </p>

      {/* Workflow endpoints from projects */}
      {workflowEntries.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Workflow Endpoints
          </h2>
          <div className="space-y-2">
            {workflowEntries.map((entry) => (
              <WorkflowCatalogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Channels from connected systems */}
      {[...channelsBySystem.entries()].map(([system, entries]) => (
        <div key={system} className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {system}
            </h2>
            <Link
              to={entries[0].systemPath}
              className="text-xs text-gray-400 hover:text-blue-600 inline-flex items-center gap-0.5"
            >
              Connected System
              <ArrowUpRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {entries.map((entry) => (
              <ChannelCatalogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
