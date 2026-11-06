import { useState } from "react";
import { Database, FolderKanban, FolderPlus, KeyRound, ScrollText, UserPlus, Users, Wrench } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { AdminCollection } from "../../model/collections";
import type { AuthProviderConfig, AuthProviderDraft, AuthProviderTest } from "../../model/authentication";
import type { AuditPage, AuditQuery } from "../../model/audit-events";
import type { AdminProject, AdminProjectDraft } from "../../model/projects";
import type { AdminUser, AdminUserDraft } from "../../model/users";
import { fullName, type MaintenanceTask } from "../../model/admin";
import { errorMessageOf } from "../../model/form-error";
import SettingsLayout from "../../components/patterns/SettingsLayout";
import type { SettingsNavItem } from "../../components/primitives/SettingsNav";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import AdminUserTable from "../../components/domain/AdminUserTable";
import UserFormModal from "../../components/domain/UserFormModal";
import AdminProjectTable from "../../components/domain/AdminProjectTable";
import ProjectFormModal from "../../components/domain/ProjectFormModal";
import AuditTrail from "../../components/domain/AuditTrail";
import AuthProviderForm from "../../components/domain/AuthProviderForm";
import AdminCollectionTable from "../../components/domain/AdminCollectionTable";
import MaintenanceTaskCard from "../../components/domain/MaintenanceTaskCard";
import Badge from "../../components/primitives/Badge";
import Button from "../../components/primitives/Button";
import Callout from "../../components/primitives/Callout";
import Card from "../../components/primitives/Card";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import Inline from "../../components/primitives/Inline";
import SearchInput from "../../components/primitives/SearchInput";
import SectionHeading from "../../components/primitives/SectionHeading";
import Stack from "../../components/primitives/Stack";
import Text from "../../components/primitives/Text";
import TextLink from "../../components/primitives/TextLink";

const BASE_PATH = "/admin-settings";

const navItems: SettingsNavItem[] = [
  { id: "users", label: "Users", icon: Users, to: `${BASE_PATH}/users` },
  { id: "projects", label: "Projects", icon: FolderKanban, to: `${BASE_PATH}/projects` },
  { id: "audit-trail", label: "Audit trail", icon: ScrollText, to: `${BASE_PATH}/audit-trail` },
  { id: "authentication", label: "Authentication", icon: KeyRound, to: `${BASE_PATH}/authentication` },
  { id: "collections", label: "Collections", icon: Database, to: `${BASE_PATH}/collections` },
  { id: "maintenance", label: "Maintenance", icon: Wrench, to: `${BASE_PATH}/maintenance` },
];

const matches = (search: string, ...values: string[]) =>
  !search.trim() || values.some((v) => v.toLowerCase().includes(search.trim().toLowerCase()));

const graceText = (days: number) => (days > 0 ? `${days} day${days === 1 ? "" : "s"} from today` : "today");

/* ------------------------------------------------------------------ */
/*  Users                                                              */
/* ------------------------------------------------------------------ */

interface UserActions {
  /** Creates an account. */
  onCreateUser: (draft: AdminUserDraft) => Promise<void>;
  /** Saves changes to an account. */
  onUpdateUser: (id: string, draft: AdminUserDraft) => Promise<void>;
  /** Disables an account, so they can't log in, or enables it again. */
  onSetUserDisabled: (id: string, disabled: boolean) => Promise<void>;
  /** Schedules an account to be deleted once the grace period is up. */
  onScheduleUserDeletion: (id: string) => Promise<void>;
  /** Cancels a scheduled deletion. */
  onCancelUserDeletion: (id: string) => Promise<void>;
  /** Deletes an account straight away, rather than at its scheduled date. Left out where deletions can only be scheduled. */
  onDeleteUserNow?: (id: string) => Promise<void>;
}

function UsersSection({
  users,
  graceDays,
  onCreateUser,
  onUpdateUser,
  onSetUserDisabled,
  onScheduleUserDeletion,
  onCancelUserDeletion,
  onDeleteUserNow,
}: { users: AdminUser[]; graceDays: number } & UserActions) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [deleting, setDeleting] = useState<{ user: AdminUser; now: boolean } | null>(null);
  const shown = users.filter((u) => matches(search, fullName(u), u.email, u.role));

  return (
    <Stack gap="md">
      <SectionHeading
        title="Users"
        description="Every account on this instance. Adding people to a project and changing their role there is usually done by the project's admins, in its settings."
        action={
          <Button size="sm" icon={UserPlus} onClick={() => setEditing("new")}>
            New user
          </Button>
        }
      />
      <SearchInput compact placeholder="Filter users" value={search} onChange={(e) => setSearch(e.target.value)} />
      <AdminUserTable
        users={shown}
        emptyMessage="No users match."
        onEdit={setEditing}
        onSetDisabled={(u, disabled) => void onSetUserDisabled(u.id, disabled)}
        onScheduleDeletion={(u) => setDeleting({ user: u, now: false })}
        onCancelDeletion={(u) => void onCancelUserDeletion(u.id)}
        onDeleteNow={onDeleteUserNow && ((u) => setDeleting({ user: u, now: true }))}
      />
      <Text tone="muted" size="xs" block>
        A superuser can reach everything on this instance, across every project, including these settings.
      </Text>

      {editing && (
        <UserFormModal
          user={editing === "new" ? undefined : editing}
          onSave={(draft) => (editing === "new" ? onCreateUser(draft) : onUpdateUser(editing.id, draft))}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmModal
        open={!!deleting}
        title={deleting?.now ? "Delete user now" : "Delete user"}
        confirmLabel={deleting?.now ? "Delete now" : "Schedule deletion"}
        confirmPhrase={deleting?.user.email}
        confirmPhraseLabel="Type the user's email to confirm"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          void (deleting.now && onDeleteUserNow ? onDeleteUserNow : onScheduleUserDeletion)(deleting.user.id);
          setDeleting(null);
        }}
      >
        {deleting && (
          <Text block>
            {fullName(deleting.user)}'s account and credential data will be deleted{" "}
            {deleting.now ? "straight away. This can't be undone" : graceText(graceDays)}. Make sure none of their
            credentials are used in production workflows.
          </Text>
        )}
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

interface ProjectActions {
  /** Creates a project with its members. */
  onCreateProject: (draft: AdminProjectDraft) => Promise<void>;
  /** Saves changes to a project and its members. */
  onUpdateProject: (id: string, draft: AdminProjectDraft) => Promise<void>;
  /** Schedules a project to be deleted once the grace period is up. */
  onScheduleProjectDeletion: (id: string) => Promise<void>;
  /** Cancels a scheduled deletion. */
  onCancelProjectDeletion: (id: string) => Promise<void>;
  /** Deletes a project straight away, rather than at its scheduled date. Left out where deletions can only be scheduled. */
  onDeleteProjectNow?: (id: string) => Promise<void>;
}

function ProjectsSection({
  projects,
  users,
  graceDays,
  onCreateProject,
  onUpdateProject,
  onScheduleProjectDeletion,
  onCancelProjectDeletion,
  onDeleteProjectNow,
}: { projects: AdminProject[]; users: AdminUser[]; graceDays: number } & ProjectActions) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProject | "new" | null>(null);
  const [deleting, setDeleting] = useState<{ project: AdminProject; now: boolean } | null>(null);
  const shown = projects.filter((p) => matches(search, p.name, p.description));

  return (
    <Stack gap="md">
      <SectionHeading
        title="Projects"
        description="Every project on this instance, whoever is in it."
        action={
          <Button size="sm" icon={FolderPlus} onClick={() => setEditing("new")}>
            New project
          </Button>
        }
      />
      <SearchInput compact placeholder="Filter projects" value={search} onChange={(e) => setSearch(e.target.value)} />
      <AdminProjectTable
        projects={shown}
        users={users}
        emptyMessage="No projects match."
        onEdit={setEditing}
        onScheduleDeletion={(p) => setDeleting({ project: p, now: false })}
        onCancelDeletion={(p) => void onCancelProjectDeletion(p.id)}
        onDeleteNow={onDeleteProjectNow && ((p) => setDeleting({ project: p, now: true }))}
      />

      {editing && (
        <ProjectFormModal
          project={editing === "new" ? undefined : editing}
          users={users.filter((u) => !u.disabled)}
          onSave={(draft) => (editing === "new" ? onCreateProject(draft) : onUpdateProject(editing.id, draft))}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmModal
        open={!!deleting}
        title={deleting?.now ? "Delete project now" : "Delete project"}
        confirmLabel={deleting?.now ? "Delete now" : "Schedule deletion"}
        confirmPhrase={deleting?.project.name}
        confirmPhraseLabel="Type the project's name to confirm"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          void (deleting.now && onDeleteProjectNow ? onDeleteProjectNow : onScheduleProjectDeletion)(deleting.project.id);
          setDeleting(null);
        }}
      >
        {deleting && (
          <Text block>
            {deleting.now
              ? `${deleting.project.name}, its workflows and its work order history are deleted straight away. This can't be undone.`
              : `Deleting ${deleting.project.name} turns off access for everyone in it and disables its workflows. The whole project is deleted, with its workflows and work order history, ${graceText(graceDays)}.`}
          </Text>
        )}
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Collections                                                        */
/* ------------------------------------------------------------------ */

function CollectionsSection({
  collections,
  onDeleteCollection,
}: {
  collections: AdminCollection[];
  onDeleteCollection: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<AdminCollection | null>(null);
  const shown = collections.filter((c) => matches(search, c.name, c.projectName));

  return (
    <Stack gap="md">
      <SectionHeading
        title="Collections"
        description={`Every collection on this instance, across all projects (${collections.length}).`}
      />
      <SearchInput compact placeholder="Filter collections" value={search} onChange={(e) => setSearch(e.target.value)} />
      <AdminCollectionTable collections={shown} onDelete={setDeleting} emptyMessage="No collections match." />
      <ConfirmModal
        open={!!deleting}
        title="Delete collection"
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) void onDeleteCollection(deleting.id);
          setDeleting(null);
        }}
      >
        {deleting && (
          <Text block>
            Delete {deleting.name} from {deleting.projectName}? Its {deleting.items.toLocaleString()} item
            {deleting.items === 1 ? "" : "s"} go with it, and workflows that read from it will fail. This can't be undone.
          </Text>
        )}
      </ConfirmModal>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

/** Everything Admin settings shows: the whole instance, for a superuser. */
export interface AdminSettingsPageData {
  /** Every account on the instance. */
  users: AdminUser[];
  /** Every project on the instance. */
  projects: AdminProject[];
  /** The page of audit events the query asks for. */
  audit: AuditPage;
  /** The audit trail's filters and page. */
  auditQuery: AuditQuery;
  /** The single sign-on provider. Absent when none is set up. */
  authProvider?: AuthProviderConfig;
  /** Where this instance is served from, the redirect host for a new provider. */
  instanceUrl: string;
  /** Every collection, across all projects. */
  collections: AdminCollection[];
  maintenance: MaintenanceTask[];
  /** Whether the instance sends OpenFn anonymous usage metrics. Set with environment variables. */
  usageMetricsEnabled: boolean;
  /** Days a scheduled deletion waits before it happens (`PURGE_DELETED_AFTER_DAYS`). */
  deletionGraceDays: number;
}

export interface AdminSettingsPageProps extends PageProps<AdminSettingsPageData>, UserActions, ProjectActions {
  /** Shows other audit events: new filters or another page. Like changing the URL, it waits for nothing. */
  onChangeAuditQuery: (query: AuditQuery) => void;
  /** Checks that a discovery URL answers with an OpenID configuration, without saving. Answers with what it found. */
  onTestAuthProvider: (draft: AuthProviderDraft) => Promise<AuthProviderTest>;
  /** Saves the single sign-on provider, creating it if there's none. */
  onSaveAuthProvider: (draft: AuthProviderDraft) => Promise<void>;
  /** Removes the single sign-on provider, which turns off single sign-on. */
  onRemoveAuthProvider: () => Promise<void>;
  /** Deletes a collection and everything in it. */
  onDeleteCollection: (id: string) => Promise<void>;
  /** Runs a maintenance task by hand; resolves when it's finished. */
  onRunMaintenance: (id: string) => Promise<void>;
}

/**
 * Admin settings, for superusers: the whole instance, across every project.
 * Users (who has an account, who's a superuser, who's disabled or due to be
 * deleted), every project and its members, the audit trail, single sign-on,
 * every collection, and maintenance jobs.
 */
export default function AdminSettingsPage({
  node,
  ancestors,
  data,
  onChangeAuditQuery,
  onTestAuthProvider,
  onSaveAuthProvider,
  onRemoveAuthProvider,
  onDeleteCollection,
  onRunMaintenance,
  ...actions
}: AdminSettingsPageProps) {
  // The /admin-settings root shows the first section.
  const activeId = navItems.some((item) => item.id === node.id) ? node.id : navItems[0].id;
  const graceDays = data.deletionGraceDays;
  // The last discovery URL test: the answer to the action, kept until the provider is removed.
  const [authTest, setAuthTest] = useState<AuthProviderTest>();

  return (
    <SettingsLayout
      breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
      title="Admin settings"
      description="The whole instance, across every project. Only superusers see this."
      navItems={navItems}
      activeId={activeId}
    >
      {activeId === "users" && <UsersSection users={data.users} graceDays={graceDays} {...actions} />}

      {activeId === "projects" && (
        <ProjectsSection projects={data.projects} users={data.users} graceDays={graceDays} {...actions} />
      )}

      {activeId === "audit-trail" && (
        <Stack gap="md">
          <SectionHeading
            title="Audit trail"
            description="Every change to workflows, credentials, projects, users and collections on this instance, newest first."
          />
          <AuditTrail page={data.audit} query={data.auditQuery} onChangeQuery={onChangeAuditQuery} />
        </Stack>
      )}

      {activeId === "authentication" && (
        <Stack gap="md">
          <SectionHeading
            title="Authentication"
            description="Single sign-on through an OpenID Connect provider. People with an account here can log in with the external account that has the same email address."
          />
          {!data.authProvider && (
            <Callout title="No provider set up">
              Everyone logs in with their email and password. Fill in the form below to add single sign-on.
            </Callout>
          )}
          <AuthProviderForm
            // A provider added or removed starts the form again from what the server holds.
            key={data.authProvider ? "provider" : "none"}
            provider={data.authProvider}
            defaultRedirectHost={data.instanceUrl}
            test={authTest}
            onTest={async (draft) => {
              try {
                setAuthTest(await onTestAuthProvider(draft));
              } catch (refused) {
                // A test the server wouldn't run says why, where a result would.
                setAuthTest({ discoveryUrl: draft.discoveryUrl, ok: false, message: errorMessageOf(refused) });
              }
            }}
            onSave={onSaveAuthProvider}
            onRemove={async () => {
              await onRemoveAuthProvider();
              setAuthTest(undefined);
            }}
          />
        </Stack>
      )}

      {activeId === "collections" && (
        <CollectionsSection collections={data.collections} onDeleteCollection={onDeleteCollection} />
      )}

      {activeId === "maintenance" && (
        <Stack gap="md">
          <SectionHeading
            title="Maintenance"
            description="Jobs that keep this instance up to date. They run on a schedule; run one here when you can't wait."
          />
          {data.maintenance.map((task) => (
            <MaintenanceTaskCard key={task.id} task={task} onRun={() => onRunMaintenance(task.id)} />
          ))}
          <Card>
            <Stack gap="sm">
              <Inline justify="between">
                <Text tone="strong">Anonymous usage metrics</Text>
                {data.usageMetricsEnabled ? <Badge label="Enabled" tone="green" /> : <Badge label="Disabled" tone="red" />}
              </Inline>
              <Text tone="muted" block>
                How this instance reports anonymous, aggregate usage to OpenFn. It's set with environment variables, so
                share this with whoever maintains the instance. See{" "}
                <TextLink href="https://docs.openfn.org/documentation/contribute/impact" variant="inline">
                  exactly what's sent
                </TextLink>
                .
              </Text>
              {!data.usageMetricsEnabled && (
                <Callout variant="warning" title="Please consider turning anonymous usage metrics back on">
                  These reports are how OpenFn shows its impact and keeps the project funded.
                </Callout>
              )}
            </Stack>
          </Card>
        </Stack>
      )}
    </SettingsLayout>
  );
}
