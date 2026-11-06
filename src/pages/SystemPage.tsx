import { useState } from "react";
import { BookOpen, FolderOpen, Globe, KeyRound, Lock, Network, Pencil, ShieldX, Trash2, User, Users } from "lucide-react";
import ConfirmModal from "../components/primitives/ConfirmModal";
import Text from "../components/primitives/Text";
import type { PageProps } from "../model/ia-tree";
import type { AccessGrant, DetailPageData } from "../model/page-data";
import type { SystemChanges } from "../model/connected-systems";
import AdaptorLogo from "../components/domain/AdaptorLogo";
import Badge from "../components/primitives/Badge";
import Button from "../components/primitives/Button";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import PropertyList from "../components/primitives/PropertyList";
import type { Property } from "../components/primitives/PropertyList";
import SectionHeading from "../components/primitives/SectionHeading";
import SystemEnvironments from "../components/domain/SystemEnvironments";
import TextLink from "../components/primitives/TextLink";
import SystemFormModal from "../components/domain/SystemFormModal";
import Inline from "../components/primitives/Inline";
import ConnectionMethodBadge from "../components/domain/ConnectionMethodBadge";
import XRoadAccessBadge from "../components/domain/XRoadAccessBadge";
import XRoadConnectionDetails from "../components/domain/XRoadConnectionDetails";
import { connectionOf } from "../model/connected-systems";

export interface SystemPageProps extends PageProps<DetailPageData> {
  /** Takes away one person's or project's access to the system. Without it, there's no Revoke. */
  onRevokeGrant?: (grantId: string) => Promise<void>;
  /** Saves changes to the system's name, description, API docs and environment URLs. Rejects with what the server refused. Without it, there's no Edit. */
  onSaveSystem?: (changes: SystemChanges) => Promise<void>;
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

export default function SystemPage({ node, ancestors, data, onRevokeGrant, onSaveSystem, onDeleteSystem }: SystemPageProps) {
  const { system } = data;
  const [revoking, setRevoking] = useState<AccessGrant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const connection = system ? connectionOf(system) : undefined;
  const xroad = connection?.method === "xroad" ? connection : undefined;

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
            (onSaveSystem || onDeleteSystem) && (
              <Inline gap="sm">
                {onSaveSystem && system && (
                  <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                )}
                {onDeleteSystem && (
                  <Button variant="outline-danger" size="sm" icon={Trash2} onClick={() => setDeleting(true)}>
                    Delete system
                  </Button>
                )}
              </Inline>
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

      {data.accessGrants && data.accessGrants.length > 0 && (
        <section>
          <SectionHeading title="Access" description={plural(data.accessGrants.length, "grant")} />
          <DataTable columns={grantColumns(onRevokeGrant && setRevoking)} rows={data.accessGrants} getRowKey={(g) => g.id} />
        </section>
      )}

      {system && onSaveSystem && (
        <SystemFormModal open={editing} onClose={() => setEditing(false)} system={system} direct={!xroad} onSave={onSaveSystem} />
      )}
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
