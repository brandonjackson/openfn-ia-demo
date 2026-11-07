import { useLocation, useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useMemberSaves, useProject, useProjectMembers, useProjectSaves } from "../../api/projects";
import { combine } from "../../api/status";
import { fetchCollectionItems, useCollections, useCollectionSaves } from "../../api/collections";
import { useWebhookAuthMethods, useWebhookAuthSaves, webhookTriggerOptions } from "../../api/webhook-auth";
import { fetchHistoryExportFile, useHistoryExports, useHistoryExportSaves } from "../../api/history-exports";
import { useProjectWorkflows } from "../../api/workflows";
import { useGitHubInstallations, useRepoConnection, useRepoConnectionSaves } from "../../api/github";
import { useAccountSaves, useMe } from "../../api/account";
import { useCredentialSchemas, useProjectCredentials } from "../../api/credentials";
import type { ProjectCredential } from "../../model/adaptor-reference";
import type { CredentialSchemaSummary } from "../../model/credentials";
import { fetchProjectYaml } from "../../api/provisioning";
import { assignableRoles, removeBlockedReason, retentionDays, retentionLabel, type ProjectRole, type ProjectSettingsPermissions } from "../../model/project-settings";
import type { Collaborator, ProjectDetails, ProjectMember } from "../../model/projects";
import { saveFile } from "../../components/primitives/save-file";
import ProjectSettingsPage, { type ProjectSettingsCredential, type ProjectSettingsPageData } from "./ProjectSettingsPage";
import { pageFrame } from "../../app/page-frame";

/** What the API says you may do here, as the settings page's permissions. */
function settingsPermissions(details: ProjectDetails): ProjectSettingsPermissions {
  const can = (action: keyof NonNullable<ProjectDetails["permissions"]>) => details.permissions?.[action] ?? false;
  return {
    canEditProject: can("edit_project"),
    canDeleteProject: can("delete_project"),
    canManageCollaborators: can("add_project_user"),
    canWriteWebhookAuth: can("write_webhook_auth_method"),
    canManageCollections: can("manage_collection"),
    canEditDataRetention: can("edit_data_retention"),
    canConfigureGitHub: can("write_github_connection"),
    canInitiateSync: can("initiate_github_sync"),
  };
}

/** A member as the collaborators table shows them, with what you may do to them. */
function asCollaborator(m: ProjectMember, yourRole: ProjectRole, yourId: string): Collaborator {
  const them = { role: m.role, isSelf: m.userId === yourId };
  return {
    id: m.userId,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email,
    role: m.role,
    isSelf: them.isSelf,
    failureAlert: m.failureAlert,
    digest: m.digest,
    assignableRoles: assignableRoles(yourRole, them),
    removeBlockedReason: removeBlockedReason(yourRole, them),
  };
}

/** A project credential as the settings list shows it, its type named by the credential schemas. */
function asSettingsCredential(c: ProjectCredential, schemas: CredentialSchemaSummary[]): ProjectSettingsCredential {
  const schema = schemas.find((t) => t.id === c.adaptor);
  return { id: c.id, name: c.name, type: schema?.name ?? c.adaptor, adaptor: schema?.adaptor, environments: c.environments ?? [], owner: c.owner };
}

/**
 * Feeds a project's Settings from the API: the project, its members, its
 * MFA requirement and data retention, its credentials, its collections, its
 * webhook auth methods (and the triggers each guards), and its history
 * exports, which the server makes in the background, and its GitHub
 * connection (which needs your account linked to GitHub to make). Exporting
 * the project and downloading an export fetch their files from the API.
 */
export default function ProjectSettingsPageQuery({ route }: { route: PageRoute }) {
  const id = route.params["project"] ?? "";
  const { status: projectStatus, project: details } = useProject(id);
  const { status: membersStatus, members } = useProjectMembers(id);
  // Only owners and admins may list collections.
  const { status: collectionsStatus } = useCollections(id, !!details?.permissions?.manage_collection);
  const { status: methodsStatus } = useWebhookAuthMethods(id);
  const { status: exportsStatus } = useHistoryExports(id);
  const { status: workflowsStatus } = useProjectWorkflows(id);
  const { status: connectionStatus } = useRepoConnection(id);
  const { status: credentialsStatus } = useProjectCredentials(id);
  const { status: meStatus } = useMe();
  const status = combine(projectStatus, membersStatus, collectionsStatus, methodsStatus, exportsStatus, workflowsStatus, connectionStatus, credentialsStatus, meStatus);
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => <ProjectSettings route={route} details={details!} members={members} />}
    </Loaded>
  );
}

function ProjectSettings({ route, details, members }: { route: PageRoute; details: ProjectDetails; members: ProjectMember[] }) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const saves = useProjectSaves();
  const memberSaves = useMemberSaves(details.id);
  const { collections } = useCollections(details.id, !!details.permissions?.manage_collection);
  const collectionSaves = useCollectionSaves();
  const { workflows } = useProjectWorkflows(details.id);
  const { methods } = useWebhookAuthMethods(details.id);
  const methodSaves = useWebhookAuthSaves(details.id, workflows);
  const { exports } = useHistoryExports(details.id);
  const exportSaves = useHistoryExportSaves(details.id);
  const { credentials } = useProjectCredentials(details.id);
  // The schemas only name each credential's type; until they load, or if they can't, its short name shows.
  const { schemas } = useCredentialSchemas();
  const { me } = useMe();
  const account = useAccountSaves(me?.id ?? "");
  const { connection } = useRepoConnection(details.id);
  const { installations } = useGitHubInstallations(!!me?.githubConnected);
  const github = useRepoConnectionSaves(details.id);

  const yourId = me?.id ?? "";
  const yourRole = members.find((m) => m.userId === yourId)?.role ?? "viewer";
  const data: ProjectSettingsPageData = {
    projectId: details.id,
    projectName: details.name,
    projectEnvironment: details.env,
    projectDescription: details.description,
    permissions: settingsPermissions(details),
    concurrencyDisabled: details.concurrency === 1,
    credentials: credentials.map((c) => asSettingsCredential(c, schemas)),
    collaborators: members.map((m) => asCollaborator(m, yourRole, yourId)),
    mfaRequired: details.requiresMfa,
    collections,
    webhookAuthMethods: methods,
    webhookTriggers: webhookTriggerOptions(workflows),
    historyExports: exports,
    github: { accountConnected: !!me?.githubConnected, installations, connection },
    dataStorage: {
      retentionPeriod: retentionLabel(details.historyRetentionDays),
      ioDataPolicy: details.retentionPolicy === "erase_all" ? "zero-persistence" : "retain",
      ioRetentionPeriod: retentionLabel(details.dataclipRetentionDays ?? details.historyRetentionDays),
    },
  };

  return (
    <ProjectSettingsPage
      {...pageFrame(route, {}, details.name)}
      data={data}
      initialSection={hash.slice(1) || undefined}
      onSaveProjectIdentity={({ name, description }) => saves.update(details.id, { name, description })}
      onSaveConcurrency={(disabled) => saves.update(details.id, { name: details.name, description: details.description, concurrency: disabled ? 1 : null })}
      onExportProject={() => fetchProjectYaml(details.id)}
      onDeleteProject={async () => {
        await saves.scheduleDeletion(details.id);
        navigate("/projects");
      }}
      onAddCollaborators={async (drafts) => {
        const notFound = [];
        for (const d of drafts) if (!(await memberSaves.addByEmail(d.email, d.role))) notFound.push(d);
        return { notFound };
      }}
      onInviteCollaborators={async (invites) => {
        for (const invite of invites) await memberSaves.invite(invite);
      }}
      onChangeCollaboratorRole={(userId, role) => memberSaves.setRole(userId, role)}
      onSetFailureAlert={(userId, failureAlert) =>
        memberSaves.setNotifications(userId, failureAlert, members.find((m) => m.userId === userId)?.digest ?? "never")
      }
      onSetDigest={(userId, digest) =>
        memberSaves.setNotifications(userId, members.find((m) => m.userId === userId)?.failureAlert ?? true, digest)
      }
      onRemoveCollaborator={(userId) => memberSaves.remove(userId)}
      onSetMfaRequired={(required) => saves.setMfaRequired(details.id, required)}
      onSaveDataStorage={(settings) =>
        saves.setDataRetention(details.id, {
          retention_policy: settings.ioDataPolicy === "zero-persistence" ? "erase_all" : "retain_all",
          history_retention_period: retentionDays(settings.retentionPeriod),
          dataclip_retention_period: settings.ioDataPolicy === "zero-persistence" ? null : retentionDays(settings.ioRetentionPeriod),
        })
      }
      onCreateCollection={async (name) => void (await collectionSaves.create(details.id, name))}
      onRenameCollection={(collectionId, name) => collectionSaves.rename(details.id, collectionId, name)}
      onDeleteCollection={(collectionId) => collectionSaves.remove(details.id, collectionId)}
      onPreviewCollection={(collectionId) => fetchCollectionItems(details.id, collections.find((c) => c.id === collectionId)?.name ?? "")}
      onCreateWebhookAuthMethod={methodSaves.create}
      onUpdateWebhookAuthMethod={methodSaves.update}
      onDeleteWebhookAuthMethod={methodSaves.remove}
      onConnectGitHubAccount={account.connectGitHub}
      onConnectGitHub={github.connect}
      onInitiateGitHubSync={github.sync}
      onDisconnectGitHub={github.disconnect}
      onCreateHistoryExport={exportSaves.create}
      onDownloadHistoryExport={async (exportId) => {
        const { fileName, file } = await fetchHistoryExportFile(details.id, exportId);
        saveFile(fileName, file);
      }}
    />
  );
}
