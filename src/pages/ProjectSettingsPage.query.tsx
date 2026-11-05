import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useMemberSaves, useProject, useProjectMembers, useProjectSaves } from "../api/projects";
import { combine } from "../api/status";
import { fetchCollectionItems, useCollections, useCollectionSaves } from "../api/collections";
import { useWebhookAuthMethods, useWebhookAuthSaves, webhookTriggerOptions } from "../api/webhook-auth";
import { useHistoryExports, useHistoryExportSaves } from "../api/history-exports";
import { useProjectWorkflows } from "../api/workflows";
import type { Collaborator, ProjectSettingsPageData } from "../model/page-data";
import {
  assignableRoles,
  removeBlockedReason,
  retentionDays,
  retentionLabel,
  type ProjectRole,
  type ProjectSettingsPermissions,
} from "../model/project-settings";
import type { ProjectDetails, ProjectMember } from "../model/projects";
import { workflowToYaml } from "../model/workflow";
import type { Project } from "../model/projects";
import { currentUser } from "../fixtures/user";
import { projectWorkOrders } from "../fixtures/history";
import { fixtureProject } from "../fixtures/projects";
import { nationalIdWorkflow, workflowGraphs } from "../fixtures/workflow";
import {
  projectSettingsPageData,
  projectSettingsRecord,
  type ProjectSettingsRecord,
} from "../fixtures/project-settings";
import { saveFile } from "../components/primitives/save-file";
import ProjectSettingsPage from "./ProjectSettingsPage";
import { pageFrame } from "./route.fixtures";
import { asProject } from "./project-records.query";

const now = () => new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

/** The project as the YAML the CLI and GitHub sync use. */
function projectYaml(project: Project, record: ProjectSettingsRecord): string {
  const indent = (text: string, by: string) =>
    text
      .split("\n")
      .map((l) => by + l)
      .join("\n");
  const workflows = project.components
    .filter((c) => c.type === "Workflow")
    .map((c) => `  ${c.id}:\n${indent(workflowToYaml({ ...(workflowGraphs[c.id] ?? nationalIdWorkflow), name: c.name }), "    ")}`);
  return [
    `name: ${record.name}`,
    `description: ${JSON.stringify(record.description)}`,
    `env: ${record.environment}`,
    `collections:`,
    ...record.collections.map((c) => `  - ${c.name}`),
    `workflows:`,
    ...workflows,
  ].join("\n");
}

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
function asCollaborator(m: ProjectMember, yourRole: ProjectRole): Collaborator {
  const them = { role: m.role, isSelf: m.email === currentUser.email };
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

/**
 * Feeds a project's Settings from the API: the project, its members, its
 * MFA requirement and data retention, its collections, its webhook auth
 * methods (and the triggers each guards), and its history exports, which the
 * server makes in the background. Its GitHub connection is still the
 * fixtures' record, copied into state on first visit, until it moves to the
 * API.
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
  return (
    <Loaded status={combine(projectStatus, membersStatus, collectionsStatus, methodsStatus, exportsStatus, workflowsStatus)} path={route.currentPath}>
      {() => <ProjectSettings route={route} details={details!} members={members} />}
    </Loaded>
  );
}

function ProjectSettings({ route, details, members }: { route: PageRoute; details: ProjectDetails; members: ProjectMember[] }) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const saves = useProjectSaves();
  const memberSaves = useMemberSaves(details.id);
  const [records, setRecords] = useState<Record<string, ProjectSettingsRecord>>({});
  const project: Project = fixtureProject(details.id) ?? asProject(details);

  const record = records[project.id] ?? projectSettingsRecord(project);
  const update = async (change: (r: ProjectSettingsRecord) => Partial<ProjectSettingsRecord>) =>
    setRecords((all) => {
      const current = all[project.id] ?? projectSettingsRecord(project);
      return { ...all, [project.id]: { ...current, ...change(current) } };
    });
  const { collections } = useCollections(details.id, !!details.permissions?.manage_collection);
  const collectionSaves = useCollectionSaves();
  const { workflows } = useProjectWorkflows(details.id);
  const { methods } = useWebhookAuthMethods(details.id);
  const methodSaves = useWebhookAuthSaves(details.id, workflows);
  const { exports } = useHistoryExports(details.id);
  const exportSaves = useHistoryExportSaves(details.id);

  const yourRole = members.find((m) => m.email === currentUser.email)?.role ?? "viewer";
  const fromRecord = projectSettingsPageData(project, record);
  const data: ProjectSettingsPageData = {
    ...fromRecord,
    projectId: details.id,
    projectName: details.name,
    projectEnvironment: details.env,
    projectDescription: details.description,
    permissions: settingsPermissions(details),
    concurrencyDisabled: details.concurrency === 1,
    collaborators: members.map((m) => asCollaborator(m, yourRole)),
    mfaRequired: details.requiresMfa,
    collections,
    webhookAuthMethods: methods,
    webhookTriggers: webhookTriggerOptions(workflows),
    historyExports: exports,
    dataStorage: {
      retentionPeriod: retentionLabel(details.historyRetentionDays),
      ioDataPolicy: details.retentionPolicy === "erase_all" ? "zero-persistence" : "retain",
      ioRetentionPeriod: retentionLabel(details.dataclipRetentionDays ?? details.historyRetentionDays),
    },
  };
  const exportRecord = { ...record, name: details.name, environment: details.env, description: details.description, collections };

  return (
    <ProjectSettingsPage
      {...pageFrame(route, {}, details.name)}
      data={data}
      initialSection={hash.slice(1) || undefined}
      onSaveProjectIdentity={({ name, description }) => saves.update(details.id, { name, description })}
      onSaveConcurrency={(disabled) => saves.update(details.id, { name: details.name, description: details.description, concurrency: disabled ? 1 : null })}
      onExportProject={async () => projectYaml(project, exportRecord)}
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
      onCreateCollection={(name) => collectionSaves.create(details.id, name)}
      onRenameCollection={(collectionId, name) => collectionSaves.rename(details.id, collectionId, name)}
      onDeleteCollection={(collectionId) => collectionSaves.remove(details.id, collectionId)}
      onPreviewCollection={(collectionId) => fetchCollectionItems(details.id, collections.find((c) => c.id === collectionId)?.name ?? "")}
      onCreateWebhookAuthMethod={methodSaves.create}
      onUpdateWebhookAuthMethod={methodSaves.update}
      onDeleteWebhookAuthMethod={methodSaves.remove}
      onConnectGitHubAccount={() => update((r) => ({ github: { ...r.github, accountConnected: true } }))}
      onConnectGitHub={(settings) =>
        update((r) => ({ github: { ...r.github, connection: { ...settings, lastSyncedAt: now() } } }))
      }
      onInitiateGitHubSync={() =>
        update((r) => ({
          github: { ...r.github, connection: r.github.connection && { ...r.github.connection, lastSyncedAt: now() } },
        }))
      }
      onDisconnectGitHub={() => update((r) => ({ github: { ...r.github, connection: undefined } }))}
      onCreateHistoryExport={exportSaves.create}
      onDownloadHistoryExport={(id) => {
        // Work orders aren't on the API yet: the file is made here from the fixtures' history.
        const file = exports.find((e) => e.id === id);
        const workOrders = projectWorkOrders(project).map((o) => ({ id: o.workOrder.id, workflow: o.workflowName, status: o.workOrder.status, receivedAt: o.receivedAt, runs: o.workOrder.runs }));
        saveFile(
          file?.fileName ?? `${details.name}-history.json`,
          JSON.stringify({ project: details.name, exportedAt: file?.createdAt, workOrders }, null, 2),
          "application/json"
        );
      }}
    />
  );
}
