import { BookOpen, ExternalLink, FolderOpen, Globe, Lock, ShieldX, User, Users } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { AccessGrant, DetailPageData, DetailSectionItem } from "../page-data";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ChannelRow from "../components/ChannelRow";
import type { ChannelRowType } from "../components/ChannelRow";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import PropertyList from "../components/PropertyList";
import type { Property } from "../components/PropertyList";
import SectionHeading from "../components/SectionHeading";
import SystemEnvironments from "../components/SystemEnvironments";
import { connectedSystems } from "../mock-data/connected-systems";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: DetailPageData;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const grantColumns: DataTableColumn<AccessGrant>[] = [
  {
    key: "grantedTo",
    header: "Granted to",
    render: (g) => {
      const isProject = g.grantedToType === "project";
      const Icon = isProject ? FolderOpen : User;
      return (
        <span className="flex items-center gap-2">
          <Icon size={14} className="flex-shrink-0 text-gray-400" />
          <span className="font-medium text-gray-900">{g.grantedTo}</span>
          <Badge label={isProject ? "Project" : "User"} tone={isProject ? "purple" : "blue"} />
        </span>
      );
    },
  },
  {
    key: "lastAccessed",
    header: "Last accessed",
    render: (g) => g.lastAccessed ?? <span className="text-gray-300">Never</span>,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => (
      <Button variant="outline-danger" size="xs" icon={ShieldX}>
        Revoke
      </Button>
    ),
  },
];

function ChannelSection({ title, items }: { title: string; items: DetailSectionItem[] }) {
  return (
    <section>
      <SectionHeading title={title} description={plural(items.length, title.toLowerCase().replace(/s$/, ""))} />
      <div className="space-y-2">
        {items.map((item) => (
          <ChannelRow
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            channelType={item.metadata?.channelType as ChannelRowType | undefined}
            autoCreated={item.metadata?.isDefault === "true"}
          />
        ))}
      </div>
    </section>
  );
}

export default function DetailTemplate({ node, ancestors, data }: Props) {
  const system = data.systemId ? connectedSystems.find((s) => s.id === data.systemId) : undefined;
  const productionUrl = system?.environments.production.url;

  // Build channel items, prepending a default HTTP channel if the system has a URL
  const channelsSection = data.sections.find((s) => s.id === "channels");
  const otherSections = data.sections.filter((s) => s.id !== "channels");

  const allChannelItems: DetailSectionItem[] = [];
  if (productionUrl && channelsSection) {
    allChannelItems.push({
      id: "default-http",
      name: "HTTP",
      description: `Default channel created when the URL was added. Sends requests directly to ${productionUrl}.`,
      metadata: { channelType: "default", isDefault: "true" },
    });
  }
  if (channelsSection) {
    allChannelItems.push(...channelsSection.items);
  }

  const properties: Property[] = [];
  if (system) {
    properties.push({ icon: system.ownerType === "org" ? Users : User, label: "Owner", value: system.owner });
    if (system.apiDocsUrl) {
      properties.push({
        icon: BookOpen,
        label: "API Docs",
        value: (
          <a
            href={system.apiDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
          >
            {system.apiDocsUrl}
            <ExternalLink size={12} className="flex-shrink-0" />
          </a>
        ),
      });
    }
  }

  const headerBadge = data.headerBadge;

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          breadcrumbs={{
            ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
            current: node.label,
          }}
          icon={Globe}
          title={node.label}
          badges={
            headerBadge && (
              <Badge
                label={headerBadge.label}
                tone={headerBadge.variant === "shared" ? "blue" : "gray"}
                icon={headerBadge.variant === "shared" ? Users : Lock}
              />
            )
          }
          description={system?.description ?? node.description}
        />
        {properties.length > 0 && (
          <div className="mt-6">
            <PropertyList properties={properties} />
          </div>
        )}
      </div>

      {system && (
        <section>
          <SectionHeading
            title="Environments"
            description="Each credential belongs to one environment. Add staging and mock credentials to build and test changes before they reach production."
          />
          <SystemEnvironments environments={system.environments} />
        </section>
      )}

      {channelsSection && <ChannelSection title={channelsSection.title} items={allChannelItems} />}

      {data.accessGrants && data.accessGrants.length > 0 && (
        <section>
          <SectionHeading title="Access" description={plural(data.accessGrants.length, "grant")} />
          <DataTable columns={grantColumns} rows={data.accessGrants} getRowKey={(g) => g.id} />
        </section>
      )}

      {otherSections.map((section) => (
        <ChannelSection key={section.id} title={section.title} items={section.items} />
      ))}
    </div>
  );
}
