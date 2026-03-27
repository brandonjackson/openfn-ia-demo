import { Link } from "react-router-dom";
import {
  Eye,
  PenLine,
  Zap,
  Users,
  Globe,
  ArrowRight,
  ExternalLink,
  User,
  KeyRound,
  AlertCircle,
  Plus,
  BookOpen,
  Plug,
} from "lucide-react";
import type { IANode } from "../ia-tree";
import Breadcrumbs from "./Breadcrumbs";
import { connectedSystems } from "../connected-systems-data";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
}

type ChannelType = "read" | "write" | "event" | "default";

interface Channel {
  id: string;
  name: string;
  description: string;
  type: ChannelType;
  isDefault?: boolean;
}

const channels: Channel[] = [
  {
    id: "notify-birth",
    name: "Notify a birth",
    description: "Submit a birth notification from a health facility.",
    type: "write",
  },
  {
    id: "birth-registered",
    name: "Birth registered",
    description: "Fires when a birth is officially registered.",
    type: "event",
  },
  {
    id: "search-birth",
    name: "Search for a birth record",
    description: "Look up births by name, date, location, or ID.",
    type: "read",
  },
  {
    id: "notify-death",
    name: "Notify a death",
    description: "Submit a death notification from a health facility.",
    type: "write",
  },
  {
    id: "death-registered",
    name: "Death registered",
    description: "Fires when a death is officially registered.",
    type: "event",
  },
  {
    id: "search-death",
    name: "Search for a death record",
    description: "Look up deaths by name, date, location, or ID.",
    type: "read",
  },
];

const typeConfig: Record<
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
  default: {
    label: "Default",
    icon: Plug,
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    iconColor: "text-blue-500",
  },
};

function ChannelCard({ channel }: { channel: Channel }) {
  const config = typeConfig[channel.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className={config.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{channel.name}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.badge}`}
          >
            {config.label}
          </span>
          {channel.isDefault && (
            <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-400">
              auto-created
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{channel.description}</p>
        {channel.type === "event" && (
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

function CredentialRow({
  label,
  credentialName,
}: {
  label: string;
  credentialName?: string;
}) {
  if (credentialName) {
    return (
      <div className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-2.5">
          <KeyRound size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{label}</span>
          <span className="font-mono text-sm text-gray-900">{credentialName}</span>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 py-2.5">
      <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-sm text-gray-500">
          No {label.toLowerCase()} credential —{" "}
          <span className="text-gray-700">add one to safely test changes in a non-production environment.</span>
        </span>
      </div>
      <button className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
        <Plus size={12} />
        Add
      </button>
    </div>
  );
}

export default function OpenCRVSSystemView({ node, ancestors }: Props) {
  const system = connectedSystems.find((s) => s.id === "opencrvs")!;

  const allChannels: Channel[] = system.url
    ? [
        {
          id: "default-http",
          name: "HTTP",
          description: `Default channel created when the URL was added. Sends requests directly to ${system.url}.`,
          type: "default",
          isDefault: true,
        },
        ...channels,
      ]
    : channels;

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      {/* Header */}
      <div className="mt-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <Globe size={22} className="text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
            {system.credentialType === "org" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                <Users size={10} />
                Shared
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                <User size={10} />
                Private
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{system.description}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 rounded-lg border border-gray-200 divide-y divide-gray-100">
        {system.url && (
          <div className="flex items-center gap-3 px-4 py-3">
            <Globe size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-500 w-24 flex-shrink-0">URL</span>
            <a
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 min-w-0 truncate"
            >
              {system.url}
              <ExternalLink size={12} className="flex-shrink-0" />
            </a>
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          {system.ownerType === "org" ? (
            <Users size={14} className="text-gray-400 flex-shrink-0" />
          ) : (
            <User size={14} className="text-gray-400 flex-shrink-0" />
          )}
          <span className="text-sm text-gray-500 w-24 flex-shrink-0">Owner</span>
          <span className="text-sm text-gray-900">{system.owner}</span>
        </div>
        {system.apiDocsUrl && (
          <div className="flex items-center gap-3 px-4 py-3">
            <BookOpen size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-500 w-24 flex-shrink-0">API Docs</span>
            <a
              href={system.apiDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 min-w-0 truncate"
            >
              {system.apiDocsUrl}
              <ExternalLink size={12} className="flex-shrink-0" />
            </a>
          </div>
        )}
      </div>

      {/* Credentials */}
      <div className="mt-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Credentials</h2>
        <p className="text-xs text-gray-400 mb-3">
          Add both production and staging credentials to safely test changes before they go live.
        </p>
        <div className="rounded-lg border border-gray-200 px-4 divide-y divide-gray-100">
          <CredentialRow label="Production" credentialName={system.productionCredential} />
          <CredentialRow label="Staging" credentialName={system.stagingCredential} />
        </div>
      </div>

      {/* Channels */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Channels</h2>
          <span className="text-xs text-gray-400">{allChannels.length} channels</span>
        </div>
        <div className="space-y-2">
          {allChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </div>
  );
}
