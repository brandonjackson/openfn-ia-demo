import type { ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import SectionHeader from "../../components/SectionHeader";
import CredentialIndex from "../../components/credentials/CredentialIndex";
import NewCredentialMenuButton, { projectCredentialMenuOptions } from "../../components/credentials/NewCredentialMenuButton";
import CollaborationPanel from "../../components/project-settings/CollaborationPanel";
import CollectionsPanel from "../../components/project-settings/CollectionsPanel";
import DataStoragePanel from "../../components/project-settings/DataStoragePanel";
import GithubSyncPanel from "../../components/project-settings/GithubSyncPanel";
import HistoryExportsPanel from "../../components/project-settings/HistoryExportsPanel";
import ProjectDeletionModal from "../../components/project-settings/ProjectDeletionModal";
import ProjectSetupPanel from "../../components/project-settings/ProjectSetupPanel";
import SandboxSettingsBanner from "../../components/project-settings/SandboxSettingsBanner";
import SecurityPanel from "../../components/project-settings/SecurityPanel";
import Tabs from "../../components/Tabs";
import { useToast } from "../../components/Toast";
import WebhookSecurityPanel from "../../components/project-settings/WebhookSecurityPanel";
import { defaultSettingsHash, projectSettingsTabs } from "../../components/project-settings/tabs";
import { collectionsIn, dataRetentionPeriods, projectFilesIn, projectSettingsFor, purgeDeletedAfterDays, vcsFor, webhookAuthMethodsIn } from "../../mock-data/project-settings";
import { credentialsFor, keychainCredentialsIn, oauthClientsFor } from "../../mock-data/credentials";
import { findProject } from "../../mock-data/projects";
import { users } from "../../mock-data/users";
import { permissionsFor } from "../../permissions";
import { useCurrentUser } from "../../session/session";
import { cn } from "../../utils/cn";

/**
 * Inventory views `project-settings-*` (live/project_live/settings.ex +
 * settings.html.heex): one page with a vertical tab list; the URL hash
 * picks the panel, defaulting to #project. /settings/delete opens the
 * project deletion modal over the Setup panel.
 */
export default function ProjectSettingsPage() {
  const { projectId } = useParams();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useCurrentUser();
  const project = findProject(projectId);

  if (!project) {
    return (
      <PageContent header={<Header title="Project settings" />}>
        <Centered>
          <p className="text-sm text-gray-500">Project not found.</p>
        </Centered>
      </PageContent>
    );
  }

  const deleting = pathname.endsWith("/settings/delete");
  const requested = hash.replace(/^#/, "");
  const active = projectSettingsTabs.some((t) => t.id === requested) ? requested : defaultSettingsHash;
  const settingsPath = `/projects/${project.id}/settings`;
  const parentProject = project.parentId ? findProject(project.parentId) : undefined;
  const sandbox = !!parentProject;
  const perms = permissionsFor(project, user);
  const settings = projectSettingsFor(project.id);

  const panels: Record<string, ReactNode> = {
    project: (
      <ProjectSetupPanel
        project={project}
        env={settings.env}
        parentProject={parentProject}
        canEditProject={perms.canEditProject}
        canDeleteProject={perms.canDeleteProject}
      />
    ),
    credentials: (
      <>
        <SectionHeader
          title="Project credentials"
          subtitle="Manage OAuth 2.0 Clients and Credentials accessible to this project."
          permissionsSection={perms.canCreateProjectCredential ? undefined : "available credentials."}
          action={
            <NewCredentialMenuButton
              id="project-credential-options-menu-button"
              options={projectCredentialMenuOptions(perms.canCreateProjectCredential, perms.canCreateKeychainCredential)}
            />
          }
        />
        {sandbox && <SandboxSettingsBanner variant="editable" />}
        <CredentialIndex
          project={project}
          credentials={credentialsFor(project, user)}
          oauthClients={oauthClientsFor(project, user)}
          keychainCredentials={keychainCredentialsIn(project)}
          canCreateProjectCredential={perms.canCreateProjectCredential}
          canCreateKeychainCredential={perms.canCreateKeychainCredential}
          canEditKeychainCredential={perms.canEditKeychainCredential}
          canCreateGlobalOauthClient={perms.canCreateGlobalOauthClient}
        />
      </>
    ),
    collections: (
      <CollectionsPanel
        projectId={project.id}
        initialCollections={collectionsIn(project.id)}
        canCreateCollection={perms.canCreateCollection}
        sandbox={sandbox}
      />
    ),
    webhook_security: (
      <WebhookSecurityPanel
        projectId={project.id}
        initialAuthMethods={webhookAuthMethodsIn(project.id)}
        canWrite={perms.canWriteWebhookAuthMethod}
        parentProject={parentProject}
      />
    ),
    collaboration: (
      <CollaborationPanel
        initialMembers={project.members}
        users={users}
        currentUserId={user.id}
        initialSupportAccess={settings.allowSupportAccess}
        canEditProject={perms.canEditProject}
        canAddProjectUser={perms.canAddProjectUser}
        canRemoveProjectUser={perms.canRemoveProjectUser}
        sandbox={sandbox}
      />
    ),
    security: (
      <SecurityPanel
        initialRequiresMfa={project.requiresMfa}
        canEditProject={perms.canEditProject}
        canRequireMfa={perms.canRequireMfa}
        parentProject={parentProject}
      />
    ),
    vcs: (
      <GithubSyncPanel
        vcs={vcsFor(project.id)}
        canInstallGithub={perms.canInstallGithub}
        canInitiateGithubSync={perms.canInitiateGithubSync}
        userGithubConnected={user.githubConnected}
        sandbox={sandbox}
      />
    ),
    "data-storage": (
      <DataStoragePanel
        initial={{
          historyRetentionPeriod: project.historyRetentionPeriod,
          dataclipRetentionPeriod: project.dataclipRetentionPeriod,
          retentionPolicy: project.retentionPolicy,
        }}
        periods={dataRetentionPeriods}
        canEditDataRetention={perms.canEditDataRetention}
        sandbox={sandbox}
      />
    ),
    "history-exports": <HistoryExportsPanel files={projectFilesIn(project.id)} users={users} sandbox={sandbox} />,
  };

  return (
    <PageContent header={<Header breadcrumbs={<ProjectBreadcrumbs project={project} current="Project settings" />} />}>
      <Centered>
        {/* Keyed by project so panel state resets when the project picker switches projects. */}
        <div key={project.id} id="project-settings-container" className="flex h-full">
          <Tabs
            orientation="vertical"
            label="Project settings"
            className="flex-none pr-8"
            tabs={projectSettingsTabs}
            active={active}
            onChange={(id) => navigate({ pathname: settingsPath, hash: id })}
          />
          <div className="min-w-0 grow">
            {projectSettingsTabs.map((t) => (
              <div
                key={t.id}
                id={`${t.id}-panel`}
                role="tabpanel"
                className={cn("space-y-4", t.id !== active && "hidden")}
              >
                {panels[t.id]}
              </div>
            ))}
          </div>
        </div>
      </Centered>
      {deleting && perms.canDeleteProject && (
        <ProjectDeletionModal
          project={project}
          gracePeriodDays={purgeDeletedAfterDays}
          key={project.id}
          onCancel={() => navigate(settingsPath)}
          onDelete={() => {
            toast("Project scheduled for deletion");
            navigate("/projects");
          }}
        />
      )}
    </PageContent>
  );
}
