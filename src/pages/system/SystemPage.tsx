import { useState } from "react";
import { BookOpen, FolderOpen, Globe, KeyRound, Lock, Network, Pencil, ShieldX, Trash2, User, Users } from "lucide-react";
import Callout from "../../components/primitives/Callout";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import { errorMessageOf } from "../../model/form-error";
import Text from "../../components/primitives/Text";
import type { PageProps } from "../../model/ia-tree";
import type { AccessGrant, ConnectedSystem, SystemChanges } from "../../model/connected-systems";
import type { XRoadRouteContext } from "../../model/xroad";
import AdaptorLogo from "../../components/domain/AdaptorLogo";
import Badge from "../../components/primitives/Badge";
import Button from "../../components/primitives/Button";
import DataTable from "../../components/primitives/DataTable";
import type { DataTableColumn } from "../../components/primitives/DataTable";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import PropertyList from "../../components/primitives/PropertyList";
import type { Property } from "../../components/primitives/PropertyList";
import SectionHeading from "../../components/primitives/SectionHeading";
import SystemEnvironments from "../../components/domain/SystemEnvironments";
import TextLink from "../../components/primitives/TextLink";
import SystemFormModal from "../../components/domain/SystemFormModal";
import Inline from "../../components/primitives/Inline";
import ConnectionMethodBadge from "../../components/domain/ConnectionMethodBadge";
import XRoadAccessBadge from "../../components/domain/XRoadAccessBadge";
import XRoadConnectionDetails from "../../components/domain/XRoadConnectionDetails";
import { connectionOf } from "../../model/connected-systems";

/** What a connected system's page shows. */
export interface SystemPageData {
  /** The system: its URL, owner, environments and how it's reached. */
  system: ConnectedSystem;
  /** For a system reached over X-Road: the organisation's identity there, and the member and service the route goes to. Absent until they're known. */
  xroad?: XRoadRouteContext;
  /** Who has access to the system. */
  accessGrants: AccessGrant[];
}

export interface SystemPageProps extends PageProps<SystemPageData> {
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
  const [busy, setBusy] = useState(false);
  const [refusal, setRefusal] = useState<{ title: string; detail: string }>();

  /** Runs a confirmed action once, closing its confirm, and says why if the server refuses. */
  const confirm = async (action: () => Promise<void> | undefined, close: () => void, failed: string) => {
    if (busy) return;
    setRefusal(undefined);
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setRefusal({ title: failed, detail: errorMessageOf(error) });
    } finally {
      setBusy(false);
      close();
    }
  };
  const connection = connectionOf(system);
  const xroad = connection.method === "xroad" ? connection : undefined;
  const shared = system.credentialType === "org";

  const properties: Property[] = [
    { icon: system.ownerType === "org" ? Users : User, label: "Owner", value: system.owner },
    {
      icon: xroad ? Network : KeyRound,
      label: "Connection",
      value: xroad
        ? "Via X-Road: routing and headers come from your organisation's X-Road settings"
        : "Direct, with a credential for each environment",
    },
  ];
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

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
          icon={Globe}
          logo={<AdaptorLogo adaptor={system.adaptor} name={system.name} size="lg" />}
          title={node.label}
          badges={
            <>
              <Badge label={shared ? "Shared" : "Private"} tone={shared ? "indigo" : "gray"} icon={shared ? Users : Lock} />
              <ConnectionMethodBadge method={connection.method} />
              {xroad && <XRoadAccessBadge status={xroad.status} />}
            </>
          }
          description={system.description}
          actions={
            (onSaveSystem || onDeleteSystem) && (
              <Inline gap="sm">
                {onSaveSystem && (
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
        <div className="mt-6">
          <PropertyList properties={properties} />
        </div>
      </div>

      {refusal && (
        <Callout variant="danger" title={refusal.title} role="alert">
          {refusal.detail}
        </Callout>
      )}

      {xroad && data.xroad && <XRoadConnectionDetails connection={xroad} {...data.xroad} />}

      {!xroad && (
        <section>
          <SectionHeading
            title="Environments"
            description="Each credential belongs to one environment. Add staging and mock credentials to build and test changes before they reach production."
          />
          <SystemEnvironments environments={system.environments} />
        </section>
      )}

      {data.accessGrants.length > 0 && (
        <section>
          <SectionHeading title="Access" description={plural(data.accessGrants.length, "grant")} />
          <DataTable columns={grantColumns(onRevokeGrant && setRevoking)} rows={data.accessGrants} getRowKey={(g) => g.id} />
        </section>
      )}

      {onSaveSystem && (
        <SystemFormModal open={editing} onClose={() => setEditing(false)} system={system} direct={!xroad} onSave={onSaveSystem} />
      )}
      <ConfirmModal
        open={!!revoking}
        title="Revoke access"
        confirmLabel={busy ? "Revoking…" : "Revoke"}
        busy={busy}
        onClose={() => !busy && setRevoking(null)}
        onConfirm={() => {
          if (!revoking) return;
          void confirm(() => onRevokeGrant?.(revoking.id), () => setRevoking(null), `${revoking.grantedTo} still has access`);
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
        confirmLabel={busy ? "Deleting…" : "Delete system"}
        busy={busy}
        confirmPhrase={node.label}
        confirmPhraseLabel="Type the system's name to confirm"
        onClose={() => !busy && setDeleting(false)}
        onConfirm={() => void confirm(() => onDeleteSystem?.(), () => setDeleting(false), `${node.label} wasn't deleted`)}
      >
        <Text block>
          {node.label} is removed from the organisation, with everyone's access to it. Workflows that use it keep their
          steps, but lose the system they talk to.
        </Text>
      </ConfirmModal>
    </div>
  );
}
