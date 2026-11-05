import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import type { HistoryExport, WebhookAuthMethod } from "../model/page-data";
import { maskSecret } from "../model/project-settings";
import { workflowToYaml } from "../model/workflow";
import type { Project } from "../model/projects";
import { currentUser } from "../fixtures/user";
import { projectWorkOrders } from "../fixtures/history";
import { nationalIdWorkflow, workflowGraphs } from "../fixtures/workflow";
import {
  projectSettingsPageData,
  projectSettingsRecord,
  type ProjectSettingsRecord,
} from "../fixtures/project-settings";
import { saveFile } from "../components/primitives/save-file";
import ProjectSettingsPage from "./ProjectSettingsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** A key like Lightning's: 32 random bytes as hex. */
function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

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

/**
 * Feeds a project's Settings from fixtures. Each project's settings record is
 * copied into state on first visit, and every action changes that copy: the
 * fixtures' stand-in for the server.
 */
export default function ProjectSettingsPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [records, setRecords] = useState<Record<string, ProjectSettingsRecord>>({});
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;

  const record = records[project.id] ?? projectSettingsRecord(project);
  const update = async (change: (r: ProjectSettingsRecord) => Partial<ProjectSettingsRecord>) =>
    setRecords((all) => {
      const current = all[project.id] ?? projectSettingsRecord(project);
      return { ...all, [project.id]: { ...current, ...change(current) } };
    });
  const updateMethod = (id: string, change: Partial<WebhookAuthMethod>) =>
    update((r) => ({ webhookAuthMethods: r.webhookAuthMethods.map((m) => (m.id === id ? { ...m, ...change } : m)) }));
  const updateExport = (id: string, change: Partial<HistoryExport>) =>
    update((r) => ({ historyExports: r.historyExports.map((e) => (e.id === id ? { ...e, ...change } : e)) }));

  return (
    <ProjectSettingsPage
      {...pageFrame(route)}
      data={projectSettingsPageData(project, record)}
      initialSection={hash.slice(1) || undefined}
      onSaveProjectIdentity={({ name, environment, description }) => update(() => ({ name, environment, description }))}
      onSaveConcurrency={(concurrencyDisabled) => update(() => ({ concurrencyDisabled }))}
      onExportProject={async () => projectYaml(project, record)}
      onDeleteProject={async () => navigate("/projects")}
      onCreateCollection={(name) =>
        update((r) => ({
          collections: [
            ...r.collections,
            { id: `col-${Date.now()}`, name, itemCount: 0, byteSize: 0, updatedAt: "Just now" },
          ],
        }))
      }
      onRenameCollection={(id, name) =>
        update((r) => ({ collections: r.collections.map((c) => (c.id === id ? { ...c, name } : c)) }))
      }
      onDeleteCollection={(id) => update((r) => ({ collections: r.collections.filter((c) => c.id !== id) }))}
      onPreviewCollection={async (id) => (record.collectionItems[id] ?? []).slice(0, 5)}
      onCreateWebhookAuthMethod={async ({ name, type, username, password, triggerIds }) => {
        const apiKey = type === "api" ? generateApiKey() : undefined;
        const method: WebhookAuthMethod = {
          id: `wam-${Date.now()}`,
          name,
          type,
          username,
          maskedSecret: apiKey ? maskSecret(apiKey) : "•".repeat(password?.length ?? 8),
          triggerIds,
        };
        await update((r) => ({ webhookAuthMethods: [...r.webhookAuthMethods, method] }));
        return { secret: apiKey };
      }}
      onUpdateWebhookAuthMethod={(id, { name, triggerIds }) => updateMethod(id, { name, triggerIds })}
      onDeleteWebhookAuthMethod={(id) =>
        update((r) => ({ webhookAuthMethods: r.webhookAuthMethods.filter((m) => m.id !== id) }))
      }
      onAddCollaborators={async (drafts) => {
        const known = drafts.filter((d) => record.users.some((u) => u.email === d.email));
        await update((r) => ({
          memberships: [
            ...r.memberships,
            ...known.map((d, i) => ({
              id: `pu-${Date.now()}-${i}`,
              email: d.email,
              role: d.role,
              failureAlert: true,
              digest: "weekly" as const,
            })),
          ],
        }));
        return { notFound: drafts.filter((d) => !known.includes(d)) };
      }}
      onInviteCollaborators={(invites) =>
        update((r) => ({
          users: [...r.users, ...invites.map(({ firstName, lastName, email }) => ({ firstName, lastName, email }))],
          memberships: [
            ...r.memberships,
            ...invites.map((inv, i) => ({
              id: `pu-${Date.now()}-${i}`,
              email: inv.email,
              role: inv.role,
              failureAlert: true,
              digest: "weekly" as const,
            })),
          ],
        }))
      }
      onChangeCollaboratorRole={(id, role) =>
        update((r) => ({
          memberships: r.memberships.map((m) => {
            if (m.id === id) return { ...m, role };
            // Handing ownership on makes the old owner an admin.
            if (role === "owner" && m.role === "owner") return { ...m, role: "admin" };
            return m;
          }),
        }))
      }
      onSetFailureAlert={(id, failureAlert) =>
        update((r) => ({ memberships: r.memberships.map((m) => (m.id === id ? { ...m, failureAlert } : m)) }))
      }
      onSetDigest={(id, digest) =>
        update((r) => ({ memberships: r.memberships.map((m) => (m.id === id ? { ...m, digest } : m)) }))
      }
      onRemoveCollaborator={(id) => update((r) => ({ memberships: r.memberships.filter((m) => m.id !== id) }))}
      onSetMfaRequired={(mfaRequired) => update(() => ({ mfaRequired }))}
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
      onSaveDataStorage={(dataStorage) => update(() => ({ dataStorage }))}
      onCreateHistoryExport={async () => {
        const id = `exp-${Date.now()}`;
        await update((r) => ({
          historyExports: [
            { id, requestedBy: `${currentUser.firstName} ${currentUser.lastName}`, createdAt: now(), status: "processing" },
            ...r.historyExports,
          ],
        }));
        // The export is made in the background, and is ready a moment later.
        const date = new Date().toISOString().slice(0, 10);
        setTimeout(
          () => void updateExport(id, { status: "completed", fileName: `${record.name}-history-${date}.json` }),
          3000
        );
      }}
      onDownloadHistoryExport={(id) => {
        const file = record.historyExports.find((e) => e.id === id);
        const workOrders = projectWorkOrders(project).map((o) => ({ id: o.workOrder.id, workflow: o.workflowName, status: o.workOrder.status, receivedAt: o.receivedAt, runs: o.workOrder.runs }));
        saveFile(
          file?.fileName ?? `${record.name}-history.json`,
          JSON.stringify({ project: record.name, exportedAt: file?.createdAt, workOrders }, null, 2),
          "application/json"
        );
      }}
    />
  );
}
