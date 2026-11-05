import { useState } from "react";
import {
  Settings,
  KeyRound,
  ShieldAlert,
  Users,
  ShieldCheck,
  GitBranch,
  Database,
  Download,
  Trash2,
  Lock,
  Layers,
  FileCode2,
} from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type {
  CollaboratorDraft,
  CollaboratorInvite,
  CollectionItem,
  Collaborator,
  DataStorageSettings,
  GitHubConnectionSettings,
  OrgCredential,
  ProjectCollection,
  ProjectSettingsPageData,
  WebhookAuthMethod,
  WebhookAuthMethodDraft,
} from "../model/page-data";
import {
  countLabel,
  retentionPeriods,
  urlSafeName,
  type DigestFrequency,
  type ProjectRole,
} from "../model/project-settings";
import SettingsLayout from "../components/patterns/SettingsLayout";
import type { SettingsNavItem } from "../components/primitives/SettingsNav";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import EnvironmentBadge from "../components/domain/EnvironmentBadge";
import SystemLabel from "../components/domain/SystemLabel";
import CollaboratorTable from "../components/domain/CollaboratorTable";
import AddCollaboratorsModal from "../components/domain/AddCollaboratorsModal";
import InviteCollaboratorsModal from "../components/domain/InviteCollaboratorsModal";
import CollectionList from "../components/domain/CollectionList";
import CollectionNameModal from "../components/domain/CollectionNameModal";
import CollectionPreviewModal from "../components/domain/CollectionPreviewModal";
import WebhookAuthMethodTable from "../components/domain/WebhookAuthMethodTable";
import WebhookAuthMethodModal from "../components/domain/WebhookAuthMethodModal";
import GitHubSyncForm from "../components/domain/GitHubSyncForm";
import GitHubConnectionSummary from "../components/domain/GitHubConnectionSummary";
import HistoryExportTable from "../components/domain/HistoryExportTable";
import SectionHeading from "../components/primitives/SectionHeading";
import Card from "../components/primitives/Card";
import Button from "../components/primitives/Button";
import Badge from "../components/primitives/Badge";
import Callout from "../components/primitives/Callout";
import CodeBlock from "../components/primitives/CodeBlock";
import ConfirmModal from "../components/primitives/ConfirmModal";
import CopyValue from "../components/primitives/CopyValue";
import DownloadButton from "../components/primitives/DownloadButton";
import FormField from "../components/primitives/FormField";
import Inline from "../components/primitives/Inline";
import Modal from "../components/primitives/Modal";
import Stack from "../components/primitives/Stack";
import Text from "../components/primitives/Text";
import TextLink from "../components/primitives/TextLink";
import ToggleSwitch from "../components/primitives/ToggleSwitch";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import { TextInput, TextArea, Select, RadioOption } from "../components/primitives/FormControls";

export interface ProjectSettingsPageProps extends PageProps<ProjectSettingsPageData> {
  /** The section to open on, e.g. "collaboration" from a link to `#collaboration`. Setup when absent. */
  initialSection?: string;
  /** Saves the project's name (already URL safe), environment and description. */
  onSaveProjectIdentity: (identity: { name: string; environment: string; description: string }) => Promise<void>;
  /** Turns off parallel execution across the project (only one run at a time), or back on. */
  onSaveConcurrency: (disabled: boolean) => Promise<void>;
  /** Builds the project as YAML, to show and download. */
  onExportProject: () => Promise<string>;
  /** Deletes the project, after its name has been typed to confirm. */
  onDeleteProject: () => Promise<void>;
  /** Makes a collection with a URL-safe name. */
  onCreateCollection: (name: string) => Promise<void>;
  /** Renames a collection, keeping its items. */
  onRenameCollection: (id: string, name: string) => Promise<void>;
  /** Deletes a collection and everything in it. */
  onDeleteCollection: (id: string) => Promise<void>;
  /** Fetches a collection's first few keys and values. */
  onPreviewCollection: (id: string) => Promise<CollectionItem[]>;
  /** Makes a webhook auth method. Resolves with the generated API key, if any, to show once. */
  onCreateWebhookAuthMethod: (draft: WebhookAuthMethodDraft) => Promise<{ secret?: string }>;
  /** Renames a webhook auth method and sets the triggers that require it. */
  onUpdateWebhookAuthMethod: (id: string, changes: { name: string; triggerIds: string[] }) => Promise<void>;
  /** Deletes a webhook auth method; its triggers stop requiring authentication. */
  onDeleteWebhookAuthMethod: (id: string) => Promise<void>;
  /** Adds people with OpenFn accounts. Resolves with the drafts whose emails have no account, to invite. */
  onAddCollaborators: (drafts: CollaboratorDraft[]) => Promise<{ notFound: CollaboratorDraft[] }>;
  /** Invites people without OpenFn accounts to join OpenFn and this project. */
  onInviteCollaborators: (invites: CollaboratorInvite[]) => Promise<void>;
  /** Changes a collaborator's role. Making someone owner hands ownership on, and you become an admin. */
  onChangeCollaboratorRole: (id: string, role: ProjectRole) => Promise<void>;
  /** Turns your own failure alerts on or off. */
  onSetFailureAlert: (id: string, enabled: boolean) => Promise<void>;
  /** Sets how often you get a digest of the project's runs. */
  onSetDigest: (id: string, digest: DigestFrequency) => Promise<void>;
  /** Removes someone from the project. */
  onRemoveCollaborator: (id: string) => Promise<void>;
  /** Requires everyone to have MFA on to open the project, or stops requiring it. */
  onSetMfaRequired: (required: boolean) => Promise<void>;
  /** Links your OpenFn account to GitHub, so you can pick an installation. */
  onConnectGitHubAccount: () => Promise<void>;
  /** Connects the project to a branch (or changes the connection) and starts the first sync. */
  onConnectGitHub: (settings: GitHubConnectionSettings) => Promise<void>;
  /** Starts a sync to the connected branch. */
  onInitiateGitHubSync: () => Promise<void>;
  /** Disconnects the project from GitHub. */
  onDisconnectGitHub: () => Promise<void>;
  /** Saves how long history and input/output data are kept. */
  onSaveDataStorage: (settings: DataStorageSettings) => Promise<void>;
  /** Starts an export of the project's work order history. */
  onCreateHistoryExport: () => Promise<void>;
  /** Downloads a completed history export. */
  onDownloadHistoryExport: (id: string) => void;
}

type SectionProps = Pick<ProjectSettingsPageProps, "data">;

/* ------------------------------------------------------------------ */
/*  Section menu                                                       */
/* ------------------------------------------------------------------ */

const navItems: SettingsNavItem[] = [
  { id: "setup", label: "Setup", icon: Settings },
  { id: "credentials", label: "Credentials", icon: KeyRound },
  { id: "collections", label: "Collections", icon: Layers },
  { id: "webhook-security", label: "Webhook security", icon: ShieldAlert },
  { id: "collaboration", label: "Collaboration", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "sync-to-github", label: "Sync to GitHub", icon: GitBranch },
  { id: "data-storage", label: "Data storage", icon: Database },
  { id: "history-exports", label: "History exports", icon: Download },
];

/** Lightning's note for someone whose role can't change a section. */
function ReadOnlyNote({ what }: { what: string }) {
  return (
    <Callout variant="warning" icon={Lock} title="Role based permissions">
      You cannot modify this project's {what}
    </Callout>
  );
}

/** "Saved" beside a form's button, once its save has come back. */
function SavedNote({ show }: { show: boolean }) {
  return show ? (
    <Text tone="success" size="xs">
      Saved
    </Text>
  ) : null;
}

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

function ProjectIdentityCard({ data, onSave }: SectionProps & { onSave: ProjectSettingsPageProps["onSaveProjectIdentity"] }) {
  const [rawName, setRawName] = useState(data.projectName);
  const [environment, setEnvironment] = useState(data.projectEnvironment);
  const [description, setDescription] = useState(data.projectDescription);
  const [saved, setSaved] = useState(false);
  const name = urlSafeName(rawName);
  const changed =
    name !== data.projectName || environment.trim() !== data.projectEnvironment || description !== data.projectDescription;
  const canEdit = data.permissions.canEditProject;
  const valid = !!name && !!environment.trim() && description.length <= 240;
  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setSaved(false);
  };

  return (
    <Card
      title="Project identity"
      description="This metadata helps you identify the types of workflows managed in this project and the people that have access."
    >
      <Stack gap="md">
        <FormField
          label="Project name"
          htmlFor="project-name"
          error={rawName && !name ? "can't be blank" : undefined}
          hint={
            <>
              Your project will be named <Text mono>{name || "…"}</Text>.
            </>
          }
        >
          <TextInput id="project-name" disabled={!canEdit} value={rawName} onChange={(e) => edit(setRawName)(e.target.value)} />
        </FormField>
        <FormField
          label="Project environment"
          htmlFor="project-environment"
          hint="Credentials will be loaded with values from this environment."
        >
          <TextInput
            id="project-environment"
            disabled={!canEdit}
            value={environment}
            onChange={(e) => edit(setEnvironment)(e.target.value)}
          />
        </FormField>
        <FormField
          label="Project description"
          htmlFor="project-description"
          hint={`A short description of a project (max 240 characters). ${240 - description.length} left.`}
          error={description.length > 240 ? "should be at most 240 characters" : undefined}
        >
          <TextArea
            id="project-description"
            disabled={!canEdit}
            rows={3}
            value={description}
            onChange={(e) => edit(setDescription)(e.target.value)}
          />
        </FormField>
        <Inline justify="end" gap="md">
          <SavedNote show={saved} />
          <Button
            disabled={!canEdit || !changed || !valid}
            onClick={async () => {
              await onSave({ name, environment: environment.trim(), description });
              setRawName(name);
              setSaved(true);
            }}
          >
            Save
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}

function ConcurrencyCard({ data, onSave }: SectionProps & { onSave: ProjectSettingsPageProps["onSaveConcurrency"] }) {
  const [disabled, setDisabled] = useState(data.concurrencyDisabled);
  const [saved, setSaved] = useState(false);
  const changed = disabled !== data.concurrencyDisabled;
  const canEdit = data.permissions.canEditProject;
  return (
    <Card
      title="Concurrency override"
      description={
        <>
          <Text size="xs" tone="muted" block>
            By default, runs are executed concurrently in accordance to limits set on individual workflows. In some
            situations, you may want to prevent concurrent execution across all workflows in a project.
          </Text>
          <Text size="xs" tone="muted" block>
            Disabling parallel run execution ensures that only one run is executed at a time, regardless of workflow,
            for this entire project.
          </Text>
        </>
      }
    >
      <Stack gap="md">
        <Inline justify="between" gap="md" wrap>
          <ToggleSwitch
            checked={disabled}
            disabled={!canEdit}
            label="Disable parallel execution"
            detail="(No more than one run at a time)"
            onChange={(v) => {
              setDisabled(v);
              setSaved(false);
            }}
          />
          <Badge label="Not allowed on Free plans" icon={Lock} />
        </Inline>
        {disabled && changed && (
          <Callout variant="warning" title="Heads up!">
            Disabling parallel run execution may significantly reduce the overall throughput of your project.
          </Callout>
        )}
        <Inline justify="end" gap="md">
          <SavedNote show={saved} />
          <Button
            disabled={!canEdit || !changed}
            onClick={async () => {
              await onSave(disabled);
              setSaved(true);
            }}
          >
            Save
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}

function ExportProjectCard({ data, onExport }: SectionProps & { onExport: ProjectSettingsPageProps["onExportProject"] }) {
  const [yaml, setYaml] = useState<string>();
  const fileName = `${data.projectName}.yaml`;
  return (
    <Card
      title="Export your project"
      description="Save your project as a YAML file to be edited locally, backed up, or deployed elsewhere."
    >
      <Button variant="secondary" icon={FileCode2} onClick={async () => setYaml(await onExport())}>
        Export project
      </Button>
      <Modal
        open={yaml !== undefined}
        title={fileName}
        onClose={() => setYaml(undefined)}
        widthClass="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setYaml(undefined)}>
              Close
            </Button>
            <DownloadButton fileName={fileName} content={yaml ?? ""} mimeType="application/yaml">
              Download
            </DownloadButton>
          </>
        }
      >
        <CodeBlock code={yaml ?? ""} label="YAML" tone="light" />
      </Modal>
    </Card>
  );
}

function SetupSection({
  data,
  onSaveProjectIdentity,
  onSaveConcurrency,
  onExportProject,
  onDeleteProject,
}: Pick<
  ProjectSettingsPageProps,
  "data" | "onSaveProjectIdentity" | "onSaveConcurrency" | "onExportProject" | "onDeleteProject"
>) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <Stack gap="lg">
      <SectionHeading
        title="Project setup"
        description="Projects are isolated workspaces that contain workflows, accessible to certain users."
      />
      {!data.permissions.canEditProject && <ReadOnlyNote what="basic settings." />}
      <ProjectIdentityCard data={data} onSave={onSaveProjectIdentity} />
      <ConcurrencyCard data={data} onSave={onSaveConcurrency} />
      <ExportProjectCard data={data} onExport={onExportProject} />
      {data.permissions.canDeleteProject && (
        <Callout variant="danger" title="The danger zone">
          <Text block>Deleting your project is irreversible</Text>
          <Button variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>
            Delete project
          </Button>
        </Callout>
      )}
      <ConfirmModal
        open={confirmDelete}
        title="Delete project"
        confirmLabel="Delete project"
        confirmPhrase={data.projectName}
        confirmPhraseLabel="Project name"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await onDeleteProject();
          setConfirmDelete(false);
        }}
      >
        <Text block>
          Enter the project name to confirm deletion: <Text tone="strong">{data.projectName}</Text>
        </Text>
        <Text block>
          Deleting this project will disable access for all users, and disable all jobs in the project. The whole
          project will be deleted along with all workflows and work order history, 7 days from today.
        </Text>
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Credentials                                                        */
/* ------------------------------------------------------------------ */

const credentialColumns: DataTableColumn<OrgCredential>[] = [
  { key: "name", header: "Name", render: (c) => <Text tone="strong">{c.name}</Text> },
  { key: "system", header: "System", render: (c) => <SystemLabel name={c.system} /> },
  { key: "environment", header: "Environment", render: (c) => <EnvironmentBadge environment={c.environment} /> },
  { key: "owner", header: "Owner", render: (c) => c.owner },
  {
    key: "access",
    header: "Access",
    render: (c) => (c.hasAccess ? <Badge label="Granted" tone="green" /> : <Badge label="No access" />),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: (c) =>
      !c.hasAccess && (
        <Button variant="outline-primary" size="xs">
          Request access
        </Button>
      ),
  },
];

function CredentialsSection({ data }: SectionProps) {
  return (
    <Stack gap="lg">
      <SectionHeading
        title="Credentials"
        description="Manage credentials available to this project. Each credential belongs to one environment: production, staging or mock."
        action={
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="User credentials are being phased out, please add credentials at the org level."
          >
            Add private credential
          </Button>
        }
      />
      <DataTable columns={credentialColumns} rows={data.orgCredentials} getRowKey={(c) => c.id} />
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Collections                                                        */
/* ------------------------------------------------------------------ */

function CollectionsSection({
  data,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onPreviewCollection,
}: Pick<
  ProjectSettingsPageProps,
  "data" | "onCreateCollection" | "onRenameCollection" | "onDeleteCollection" | "onPreviewCollection"
>) {
  const [naming, setNaming] = useState<{ collection?: ProjectCollection }>();
  const [deleting, setDeleting] = useState<ProjectCollection>();
  const [preview, setPreview] = useState<{ collection: ProjectCollection; items?: CollectionItem[] }>();
  const canManage = data.permissions.canManageCollections;
  const create = () => setNaming({});
  const names = data.collections.map((c) => c.name);

  return (
    <Stack gap="lg">
      <SectionHeading
        title="Project collections"
        description="Manage collections for this project."
        action={
          canManage && (
            <Button size="sm" onClick={create}>
              Create collection
            </Button>
          )
        }
      />
      {!canManage && <ReadOnlyNote what="available collections." />}
      <CollectionList
        collections={data.collections}
        onPreview={async (collection) => {
          setPreview({ collection });
          const items = await onPreviewCollection(collection.id);
          setPreview((p) => (p?.collection.id === collection.id ? { collection, items } : p));
        }}
        onRename={canManage ? (collection) => setNaming({ collection }) : undefined}
        onDelete={canManage ? setDeleting : undefined}
        onCreate={canManage ? create : undefined}
      />
      <CollectionNameModal
        open={naming !== undefined}
        currentName={naming?.collection?.name}
        takenNames={names.filter((n) => n !== naming?.collection?.name)}
        onClose={() => setNaming(undefined)}
        onSave={(name) => (naming?.collection ? onRenameCollection(naming.collection.id, name) : onCreateCollection(name))}
      />
      <CollectionPreviewModal collection={preview?.collection} items={preview?.items} onClose={() => setPreview(undefined)} />
      <ConfirmModal
        open={!!deleting}
        title="Delete collection"
        confirmLabel="Delete"
        onClose={() => setDeleting(undefined)}
        onConfirm={async () => {
          if (deleting) await onDeleteCollection(deleting.id);
          setDeleting(undefined);
        }}
      >
        <Text block>
          Are you sure you want to delete the collection <Text tone="strong">{deleting?.name}</Text>? Its{" "}
          {countLabel(deleting?.itemCount ?? 0, "item")} will be deleted with it, and workflows that use it will fail.
        </Text>
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Webhook security                                                   */
/* ------------------------------------------------------------------ */

function WebhookSecuritySection({
  data,
  onCreateWebhookAuthMethod,
  onUpdateWebhookAuthMethod,
  onDeleteWebhookAuthMethod,
}: Pick<
  ProjectSettingsPageProps,
  "data" | "onCreateWebhookAuthMethod" | "onUpdateWebhookAuthMethod" | "onDeleteWebhookAuthMethod"
>) {
  const [editing, setEditing] = useState<{ method?: WebhookAuthMethod }>();
  const [deleting, setDeleting] = useState<WebhookAuthMethod>();
  const canWrite = data.permissions.canWriteWebhookAuth;
  const create = () => setEditing({});
  const linked = (deleting?.triggerIds ?? []).map(
    (id) => data.webhookTriggers.find((t) => t.id === id)?.workflowName ?? id
  );

  return (
    <Stack gap="lg">
      <SectionHeading
        title="Webhook security"
        description="Webhook authentication methods that are used with the starting trigger in workflows."
        action={
          canWrite && (
            <Button size="sm" onClick={create}>
              New auth method
            </Button>
          )
        }
      />
      {!canWrite && <ReadOnlyNote what="webhook auth methods." />}
      <WebhookAuthMethodTable
        methods={data.webhookAuthMethods}
        triggers={data.webhookTriggers}
        onEdit={canWrite ? (method) => setEditing({ method }) : undefined}
        onDelete={canWrite ? setDeleting : undefined}
        onCreate={canWrite ? create : undefined}
      />
      <WebhookAuthMethodModal
        open={editing !== undefined}
        method={editing?.method}
        triggers={data.webhookTriggers}
        takenNames={data.webhookAuthMethods.filter((m) => m.id !== editing?.method?.id).map((m) => m.name)}
        onClose={() => setEditing(undefined)}
        onCreate={onCreateWebhookAuthMethod}
        onUpdate={onUpdateWebhookAuthMethod}
      />
      <ConfirmModal
        open={!!deleting}
        title="Delete authentication method"
        confirmLabel="Delete authentication method"
        confirmPhrase="DELETE"
        confirmPhraseLabel="Type in 'DELETE' to confirm the deletion"
        onClose={() => setDeleting(undefined)}
        onConfirm={async () => {
          if (deleting) await onDeleteWebhookAuthMethod(deleting.id);
          setDeleting(undefined);
        }}
      >
        {linked.length === 0 ? (
          <Text block>
            You are about to delete the webhook auth method <Text tone="strong">{deleting?.name}</Text>, used by no
            workflows.
          </Text>
        ) : (
          <>
            <Text block>
              You are about to delete the webhook auth method <Text tone="strong">{deleting?.name}</Text>. This cannot be
              undone, and it will be removed from everything listed below.
            </Text>
            <Callout variant="warning" title={`${countLabel(linked.length, "workflow trigger")} will stop requiring authentication`}>
              <Stack gap="xs">
                {linked.map((name) => (
                  <Text key={name} mono size="xs">
                    {name}
                  </Text>
                ))}
              </Stack>
            </Callout>
          </>
        )}
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Collaboration                                                      */
/* ------------------------------------------------------------------ */

function CollaborationSection({
  data,
  onAddCollaborators,
  onInviteCollaborators,
  onChangeCollaboratorRole,
  onSetFailureAlert,
  onSetDigest,
  onRemoveCollaborator,
}: Pick<
  ProjectSettingsPageProps,
  | "data"
  | "onAddCollaborators"
  | "onInviteCollaborators"
  | "onChangeCollaboratorRole"
  | "onSetFailureAlert"
  | "onSetDigest"
  | "onRemoveCollaborator"
>) {
  const [adding, setAdding] = useState(false);
  const [toInvite, setToInvite] = useState<CollaboratorDraft[]>([]);
  const [removing, setRemoving] = useState<Collaborator>();
  const [newOwner, setNewOwner] = useState<Collaborator>();
  const canManage = data.permissions.canManageCollaborators;

  return (
    <Stack gap="lg">
      <SectionHeading
        title="Project collaboration"
        description="View collaborators and manage alert settings for this project."
        action={
          canManage && (
            <Button size="sm" icon={Users} onClick={() => setAdding(true)}>
              Add collaborators
            </Button>
          )
        }
      />
      {!canManage && <ReadOnlyNote what="collaboration settings, but you can change your notification preferences." />}
      <CollaboratorTable
        collaborators={data.collaborators}
        onChangeRole={
          canManage
            ? (id, role) => {
                const them = data.collaborators.find((c) => c.id === id);
                if (role === "owner") setNewOwner(them);
                else void onChangeCollaboratorRole(id, role);
              }
            : undefined
        }
        onSetFailureAlert={(id, on) => void onSetFailureAlert(id, on)}
        onSetDigest={(id, digest) => void onSetDigest(id, digest)}
        onRemove={canManage ? setRemoving : undefined}
      />
      <AddCollaboratorsModal
        open={adding}
        existingEmails={data.collaborators.map((c) => c.email)}
        onClose={() => setAdding(false)}
        onAdd={async (drafts) => {
          const { notFound } = await onAddCollaborators(drafts);
          setToInvite(notFound);
        }}
      />
      <InviteCollaboratorsModal people={toInvite} onClose={() => setToInvite([])} onInvite={onInviteCollaborators} />
      <ConfirmModal
        open={!!removing}
        title={`Remove ${removing?.firstName} ${removing?.lastName}`}
        confirmLabel="Remove collaborator"
        onClose={() => setRemoving(undefined)}
        onConfirm={async () => {
          if (removing) await onRemoveCollaborator(removing.id);
          setRemoving(undefined);
        }}
      >
        <Text block>
          Are you sure you want to remove &ldquo;{removing?.firstName} {removing?.lastName}&rdquo; from this project?
          They will no longer have access to this project.
        </Text>
      </ConfirmModal>
      <ConfirmModal
        open={!!newOwner}
        title={`Make ${newOwner?.firstName} ${newOwner?.lastName} the owner?`}
        confirmLabel="Transfer ownership"
        tone="primary"
        onClose={() => setNewOwner(undefined)}
        onConfirm={async () => {
          if (newOwner) await onChangeCollaboratorRole(newOwner.id, "owner");
          setNewOwner(undefined);
        }}
      >
        <Text block>
          A project has one owner, who alone can delete it. You'll become an admin of this project, and only{" "}
          {newOwner?.firstName} will be able to change that.
        </Text>
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Security                                                           */
/* ------------------------------------------------------------------ */

function SecuritySection({ data, onSetMfaRequired }: Pick<ProjectSettingsPageProps, "data" | "onSetMfaRequired">) {
  const canEdit = data.permissions.canEditProject;
  return (
    <Stack gap="lg">
      <SectionHeading title="Project security" description="View and manage security settings for this project." />
      {!canEdit && <ReadOnlyNote what="multi-factor authentication settings." />}
      <Card
        title="Multi-factor authentication"
        description="Requiring multi-factor authentication (MFA) adds an additional layer of security by requiring users to enable MFA on their accounts before they are allowed access this project."
      >
        <ToggleSwitch
          checked={data.mfaRequired}
          disabled={!canEdit}
          title={canEdit ? undefined : "You do not have permission to perform this action"}
          label="Require MFA?"
          detail={`(currently ${data.mfaRequired ? "required" : "optional"} for this project)`}
          onChange={(required) => void onSetMfaRequired(required)}
        />
      </Card>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Sync to GitHub                                                     */
/* ------------------------------------------------------------------ */

function SyncDocsNote() {
  return (
    <Text size="xs" tone="muted" block>
      Learn more about synchronizing your project with GitHub at{" "}
      <TextLink variant="inline" href="https://docs.openfn.org/documentation/link-to-GitHub">
        docs.openfn.org
      </TextLink>
    </Text>
  );
}

function SyncToGitHubSection({
  data,
  onConnectGitHubAccount,
  onConnectGitHub,
  onInitiateGitHubSync,
  onDisconnectGitHub,
}: Pick<
  ProjectSettingsPageProps,
  "data" | "onConnectGitHubAccount" | "onConnectGitHub" | "onInitiateGitHubSync" | "onDisconnectGitHub"
>) {
  const [editing, setEditing] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { github, permissions } = data;
  const connection = github.connection;
  const cliCommands = [
    { label: "Pull this project into a local workspace:", command: `openfn project pull ${data.projectId}` },
    { label: "Push local changes back to this project:", command: "openfn project deploy" },
    { label: "Run a workflow:", command: "openfn <workflow-name>" },
  ];

  return (
    <Stack gap="lg">
      <SectionHeading
        title="Version control"
        description="View or modify external version control settings for this project."
      />
      {connection && !editing ? (
        <Card title="Connected to GitHub">
          <GitHubConnectionSummary
            projectId={data.projectId}
            connection={connection}
            installations={github.installations}
            onSync={
              permissions.canInitiateSync && !syncing
                ? async () => {
                    setSyncing(true);
                    await onInitiateGitHubSync();
                    setSyncing(false);
                  }
                : undefined
            }
            onEdit={permissions.canConfigureGitHub ? () => setEditing(true) : undefined}
            onDisconnect={permissions.canConfigureGitHub ? () => setConfirmDisconnect(true) : undefined}
          />
        </Card>
      ) : !permissions.canConfigureGitHub ? (
        <Card title="Configure two-way sync to GitHub">
          <Callout variant="warning" icon={Lock} title="Role based permissions">
            You cannot modify this project's version control configuration
            {permissions.canInitiateSync ? " but you can initiate a sync." : "."}
          </Callout>
        </Card>
      ) : !github.accountConnected ? (
        <Card title="Connect your OpenFn account to GitHub">
          <Stack gap="md">
            <SyncDocsNote />
            <Text size="xs" tone="muted" block>
              You need to do this before you can set up sync.
            </Text>
            <Inline>
              <Button variant="dark" icon={GitBranch} onClick={() => void onConnectGitHubAccount()}>
                Connect your GitHub account
              </Button>
            </Inline>
          </Stack>
        </Card>
      ) : (
        <Card title="Configure two-way sync to GitHub" description={<SyncDocsNote />}>
          <GitHubSyncForm
            projectId={data.projectId}
            installations={github.installations}
            initial={editing ? connection : undefined}
            onCancel={editing ? () => setEditing(false) : undefined}
            onConnect={async (settings) => {
              await onConnectGitHub(settings);
              setEditing(false);
            }}
          />
        </Card>
      )}
      <Card
        title="Sync with CLI"
        description={
          <>
            Use the OpenFn CLI to download, deploy and execute workflows in this project. You'll need a Personal Access
            Token in your environment for these commands to work:{" "}
            <TextLink variant="inline" href="https://docs.openfn.org/documentation/sync#authorization">
              see the authorization docs
            </TextLink>
            .
          </>
        }
      >
        <Stack gap="md">
          {cliCommands.map((c) => (
            <Stack key={c.command} gap="xs">
              <Text size="xs" tone="muted">
                {c.label}
              </Text>
              <CopyValue value={c.command} label="Copy command" />
            </Stack>
          ))}
        </Stack>
      </Card>
      <ConfirmModal
        open={confirmDisconnect}
        title="Remove integration?"
        confirmLabel="Disconnect"
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={async () => {
          await onDisconnectGitHub();
          setConfirmDisconnect(false);
        }}
      >
        <Text block>
          You are about to disconnect this project from GitHub, disabling two-way sync. You can reconnect at any time.
        </Text>
        <Text block>
          This removes the deploy workflow and API secret from {connection?.repo}. Any other files the sync committed to{" "}
          {connection?.branch}, like the project and workflow files, stay in the repo.
        </Text>
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Data storage                                                       */
/* ------------------------------------------------------------------ */

function DataStorageSection({ data, onSaveDataStorage }: Pick<ProjectSettingsPageProps, "data" | "onSaveDataStorage">) {
  const [draft, setDraft] = useState<DataStorageSettings>(data.dataStorage);
  const [saved, setSaved] = useState(false);
  const canEdit = data.permissions.canEditDataRetention;
  const saved0 = data.dataStorage;
  const changed =
    draft.retentionPeriod !== saved0.retentionPeriod ||
    draft.ioDataPolicy !== saved0.ioDataPolicy ||
    draft.ioRetentionPeriod !== saved0.ioRetentionPeriod;
  const set = (change: Partial<DataStorageSettings>) => {
    setDraft((d) => ({ ...d, ...change }));
    setSaved(false);
  };

  return (
    <Stack gap="lg">
      <SectionHeading title="Data storage" description="View or modify data storage settings for this project." />
      {!canEdit && <ReadOnlyNote what="data storage settings." />}
      <Card
        title="History retention period"
        description="Select how long your run history is stored in OpenFn before being removed from the servers. This includes all Work Orders, Runs, and Logs."
      >
        <Stack gap="sm">
          <Select
            aria-label="History retention period"
            options={retentionPeriods}
            disabled={!canEdit}
            value={draft.retentionPeriod}
            onChange={(e) => set({ retentionPeriod: e.target.value })}
          />
          <Text size="xs" tone="subtle">
            Retention periods cannot be configured for projects on the free plan.
          </Text>
        </Stack>
      </Card>
      <Card
        title="Input/output data storage policy"
        description="The input and output data associated with workflow runs and channel requests is useful for debugging. However it can contain sensitive PII. Should OpenFn store this data?"
      >
        <Stack gap="sm">
          <RadioOption
            name="io-policy"
            value="retain"
            label="Retain all input/output data"
            disabled={!canEdit}
            checked={draft.ioDataPolicy === "retain"}
            onChange={() => set({ ioDataPolicy: "retain" })}
          />
          <RadioOption
            name="io-policy"
            value="zero-persistence"
            label="Never retain input/output data (zero-persistence)"
            disabled={!canEdit}
            checked={draft.ioDataPolicy === "zero-persistence"}
            onChange={() => set({ ioDataPolicy: "zero-persistence" })}
          />
          {draft.ioDataPolicy === "zero-persistence" && (
            <Callout variant="warning" title="Heads up!">
              When enabled, you will no longer be able to retry workflow runs, and channel request/response payloads
              will not be stored.
            </Callout>
          )}
        </Stack>
      </Card>
      {draft.ioDataPolicy === "retain" && (
        <Card
          title="Input/output data retention period"
          description="Select how long input/output data is stored. Once input/output data is removed for a given run, you will no longer be able to retry that run."
        >
          <Select
            aria-label="Input/output data retention period"
            options={retentionPeriods}
            disabled={!canEdit}
            value={draft.ioRetentionPeriod}
            onChange={(e) => set({ ioRetentionPeriod: e.target.value })}
          />
        </Card>
      )}
      <Inline justify="end" gap="sm">
        <SavedNote show={saved} />
        <Button variant="secondary" disabled={!canEdit || !changed} onClick={() => setDraft(data.dataStorage)}>
          Cancel
        </Button>
        <Button
          disabled={!canEdit || !changed}
          onClick={async () => {
            await onSaveDataStorage(draft);
            setSaved(true);
          }}
        >
          Save
        </Button>
      </Inline>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  History exports                                                    */
/* ------------------------------------------------------------------ */

function HistoryExportsSection({
  data,
  onCreateHistoryExport,
  onDownloadHistoryExport,
}: Pick<ProjectSettingsPageProps, "data" | "onCreateHistoryExport" | "onDownloadHistoryExport">) {
  const busy = data.historyExports.some((e) => e.status === "enqueued" || e.status === "processing");
  return (
    <Stack gap="lg">
      <SectionHeading
        title="History exports"
        description="View export status and download work order history for this project."
        action={
          <Button
            size="sm"
            icon={Download}
            disabled={busy}
            title={busy ? "An export is already being made" : undefined}
            onClick={() => void onCreateHistoryExport()}
          >
            Create export
          </Button>
        }
      />
      <HistoryExportTable exports={data.historyExports} onDownload={onDownloadHistoryExport} />
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

/**
 * A project's settings, section by section as in Lightning: its identity,
 * credentials, collections, webhook security, collaborators, MFA rule, GitHub
 * sync, data retention and history exports. What you can change follows your
 * role, through `data.permissions` and each collaborator row.
 */
export default function ProjectSettingsPage(props: ProjectSettingsPageProps) {
  const { node, ancestors, data, initialSection } = props;
  const sectionOf = (id?: string) => (navItems.some((i) => i.id === id) ? (id as string) : "setup");
  const [activeTab, setActiveTab] = useState(sectionOf(initialSection));
  // Follow a link to another section while the page is already open.
  const [linkedSection, setLinkedSection] = useState(initialSection);
  if (initialSection !== linkedSection) {
    setLinkedSection(initialSection);
    if (initialSection) setActiveTab(sectionOf(initialSection));
  }

  const projectLabel = ancestors.length > 0 ? ancestors[ancestors.length - 1].node.label : "Project";

  return (
    <SettingsLayout
      breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
      title={`${projectLabel} settings`}
      description="Manage settings and configuration for this project."
      navItems={navItems}
      activeId={activeTab}
      onSelect={setActiveTab}
    >
      {activeTab === "setup" && <SetupSection {...props} />}
      {activeTab === "credentials" && <CredentialsSection data={data} />}
      {activeTab === "collections" && <CollectionsSection {...props} />}
      {activeTab === "webhook-security" && <WebhookSecuritySection {...props} />}
      {activeTab === "collaboration" && <CollaborationSection {...props} />}
      {activeTab === "security" && <SecuritySection {...props} />}
      {activeTab === "sync-to-github" && <SyncToGitHubSection {...props} />}
      {activeTab === "data-storage" && <DataStorageSection {...props} />}
      {activeTab === "history-exports" && <HistoryExportsSection {...props} />}
    </SettingsLayout>
  );
}
