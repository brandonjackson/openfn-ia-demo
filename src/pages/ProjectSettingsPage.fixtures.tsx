import type { PageRoute } from "../app/ia-utils";
import type { ProjectSettingsPageData } from "../model/page-data";
import type { Project } from "../model/projects";
import { orgCredentials } from "../fixtures/connected-systems";
import ProjectSettingsPage from "./ProjectSettingsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** A project's settings, with the prototype's one collaborator. */
function projectSettingsData(project: Project): ProjectSettingsPageData {
  return {
    pageType: "project-settings",
    projectName: project.name.toLowerCase().replace(/\s+/g, "-"),
    projectEnvironment: "main",
    projectDescription: project.description,
    collaborators: [
      {
        name: "Brandon Jackson",
        email: "brandon@openfn.org",
        role: "Owner",
        isSelf: true,
        failureAlert: "Unavailable",
        digest: "Never",
      },
    ],
    orgCredentials,
    retentionPeriod: "7 Days",
    ioDataPolicy: "retain",
    ioRetentionPeriod: "7 Days",
    mfaRequired: false,
    githubConnected: false,
    concurrencyDisabled: false,
  };
}

/** Feeds a project's Settings from fixtures. */
export default function ProjectSettingsPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return <ProjectSettingsPage {...pageFrame(route)} data={projectSettingsData(project)} />;
}
