import { useState } from "react";
import { BookOpen, FolderOpen, Globe, KeyRound, Lock, Network, ShieldX, Trash2, User, Users } from "lucide-react";
import ConfirmModal from "../components/primitives/ConfirmModal";
import Text from "../components/primitives/Text";
import type { PageProps } from "../model/ia-tree";
import type { AccessGrant, DetailPageData, DetailSectionItem } from "../model/page-data";
import AdaptorLogo from "../components/domain/AdaptorLogo";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import ChannelRow from "../components/domain/ChannelRow";
import type { ChannelRowType } from "../components/domain/ChannelRow";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import PropertyList from "../components/primitives/PropertyList";
import type { Property } from "../components/primitives/PropertyList";
import SectionHeading from "../components/primitives/SectionHeading";
import SystemEnvironments from "../components/domain/SystemEnvironments";
import TextLink from "../components/primitives/TextLink";
import ConnectionMethodBadge from "../components/domain/ConnectionMethodBadge";
import XRoadAccessBadge from "../components/domain/XRoadAccessBadge";
import XRoadConnectionDetails from "../components/domain/XRoadConnectionDetails";
import { connectionOf } from "../model/connected-systems";

export interface SystemPageProps extends PageProps<DetailPageData> {
  /** Starts a new workflow in a project, triggered by one of the system's event channels. */
  onStartWorkflow: (projectId: string, channelId: string) => void;
  /** Takes away one person's or project's access to the system. Without it, there's no Revoke. */
  onRevokeGrant?: (grantId: string) => Promise<void>;
  /** Removes the system from the organisation, with everyone's access to it. Without it, there's no Delete. */
  onDeleteSystem?: () => Promise<void>;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const grantColumns = (onRevoke?: (grant: AccessGrant) => void): DataTableColumn<AccessGrant>[] => [
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
          <Badge label={isProject ? "Project" : "User"} tone={isProject ? "pink" : "indigo"} />
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
    render: (g) =>
      onRevoke && (
        <Button variant="outline-danger" size="xs" icon={ShieldX} onClick={() => onRevoke(g)}>
          Revoke
        </Button>
      ),
  },
];

interface StartWorkflow {
  /** Projects a new workflow can be started in, from an event channel. */
  projects?: { id: string; name: string }[];
  /** Starts a new workflow in a project, triggered by an event channel. */
  onStartWorkflow?: (projectId: string, channelId: string) => void;
}

function ChannelSection({
  title,
  items,
  projects,
  onStartWorkflow,
}: { title: string; items: DetailSectionItem[] } & StartWorkflow) {
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
            projects={projects}
            onStartWorkflow={onStartWorkflow}
          />
        ))}
      </div>
    </section>
  );
}

export default function SystemPage({ node, ancestors, data, onStartWorkflow, onRevokeGrant, onDeleteSystem }: SystemPageProps) {
  const { system } = data;
  const [revoking, setRevoking] = useState<AccessGrant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const connection = system ? connectionOf(system) : undefined;
  const xroad = connection?.method === "xroad" ? connection : undefined;
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
    properties.push({
      icon: xroad ? Network : KeyRound,
      label: "Connection",
      value: xroad
        ? "Via X-Road: routing and headers come from your organisation's X-Road settings"
        : "Direct, with a credential for each environment",
    });
    if (system.apiDocsUrl) {
      properties.push({
        icon: BookOpen,
        label: "API docs",
        value: (
          <TextLink href={system.apiDocsUrl} variant="inline">
            {system.apiDocsUrl}
          </TextLink>
        ),
      });
    }
  }

  const headerBadge = data.headerBadge;

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
          icon={Globe}
          logo={system && <AdaptorLogo adaptor={system.adaptor} name={system.name} size="lg" />}
          title={node.label}
          badges={
            <>
              {headerBadge && (
                <Badge
                  label={headerBadge.label}
                  tone={headerBadge.variant === "shared" ? "indigo" : "gray"}
                  icon={headerBadge.variant === "shared" ? Users : Lock}
                />
              )}
              {connection && <ConnectionMethodBadge method={connection.method} />}
              {xroad && <XRoadAccessBadge status={xroad.status} />}
            </>
          }
          description={system?.description ?? node.description}
          actions={
            onDeleteSystem && (
              <Button variant="outline-danger" size="sm" icon={Trash2} onClick={() => setDeleting(true)}>
                Delete system
              </Button>
            )
          }
        />
        {properties.length > 0 && (
          <div className="mt-6">
            <PropertyList properties={properties} />
          </div>
        )}
      </div>

      {xroad && data.xroad && <XRoadConnectionDetails connection={xroad} {...data.xroad} />}

      {system && !xroad && (
        <section>
          <SectionHeading
            title="Environments"
            description="Each credential belongs to one environment. Add staging and mock credentials to build and test changes before they reach production."
          />
          <SystemEnvironments environments={system.environments} />
        </section>
      )}

      {channelsSection && !xroad && <ChannelSection title={channelsSection.title} items={allChannelItems} projects={data.projects} onStartWorkflow={onStartWorkflow} />}

      {data.accessGrants && data.accessGrants.length > 0 && (
        <section>
          <SectionHeading title="Access" description={plural(data.accessGrants.length, "grant")} />
          <DataTable columns={grantColumns(onRevokeGrant && setRevoking)} rows={data.accessGrants} getRowKey={(g) => g.id} />
        </section>
      )}

      {otherSections.map((section) => (
        <ChannelSection
          key={section.id}
          title={section.title}
          items={section.items}
          projects={data.projects}
          onStartWorkflow={onStartWorkflow}
        />
      ))}
      <ConfirmModal
        open={!!revoking}
        title="Revoke access"
        confirmLabel="Revoke"
        onClose={() => setRevoking(null)}
        onConfirm={async () => {
          if (revoking) await onRevokeGrant?.(revoking.id);
          setRevoking(null);
        }}
      >
        <Text block>
          {revoking?.grantedTo} will no longer reach {node.label}
          {revoking?.scope && revoking.scope !== "All Resources" ? ` (${revoking.scope})` : ""}.
        </Text>
      </ConfirmModal>
      <ConfirmModal
        open={deleting}
        title="Delete system"
        confirmLabel="Delete system"
        confirmPhrase={node.label}
        confirmPhraseLabel="Type the system's name to confirm"
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await onDeleteSystem?.();
          setDeleting(false);
        }}
      >
        <Text block>
          {node.label} is removed from the organisation, with everyone's access to it. Workflows that use it keep their
          steps, but lose the system they talk to.
        </Text>
      </ConfirmModal>
    </div>
  );
}
