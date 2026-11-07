import type { ComponentType } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { iaTree, treeForViewer, visibleTree, type IANode } from "../model/ia-tree";
import { flagById } from "../model/feature-flags";
import { useFlags } from "./feature-flags";
import { findNodeByPath, type PageRoute as Route } from "./ia-utils";
import { useShell } from "../components/domain/shell-context";
import { apiProjectId, projects as fixtureProjects } from "../fixtures/projects";
import { apiSystemId } from "../fixtures/ids";
import Callout from "../components/primitives/Callout";
import LoadingState from "../components/primitives/LoadingState";
import NotFoundPage from "../pages/NotFoundPage";
import OverviewPageQuery from "../pages/OverviewPage.query";
import SystemsPageQuery from "../pages/SystemsPage.query";
import SystemPageQuery from "../pages/SystemPage.query";
import HistoryPageQuery from "../pages/HistoryPage.query";
import ServicesPageQuery from "../pages/ServicesPage.query";
import ProjectsPageQuery from "../pages/projects/ProjectsPage.query";
import ProjectPageQuery from "../pages/project/ProjectPage.query";
import ProjectWorkflowsPageQuery from "../pages/project-workflows/ProjectWorkflowsPage.query";
import ProjectComponentsPageQuery from "../pages/project-components/ProjectComponentsPage.query";
import ProjectCreatePageQuery from "../pages/ProjectCreatePage.query";
import ProjectSandboxesPageQuery from "../pages/ProjectSandboxesPage.query";
import ProjectSettingsPageQuery from "../pages/ProjectSettingsPage.query";
import ServicePageQuery from "../pages/ServicePage.query";
import ComponentPageQuery from "../pages/ComponentPage.query";
import StatusPageFixtures from "../pages/StatusPage.fixtures";
import InsightsPageQuery from "../pages/InsightsPage.query";
import UserSettingsPageQuery from "../pages/user-settings/UserSettingsPage.query";
import OrganizationSettingsPageQuery from "../pages/organization-settings/OrganizationSettingsPage.query";
import AdminSettingsPageQuery from "../pages/admin-settings/AdminSettingsPage.query";
import HandbookPageQuery from "../pages/handbook/HandbookPage.query";
import PlaceholderPageQuery from "../pages/placeholder/PlaceholderPage.query";

type PageType = NonNullable<IANode["pageType"]>;

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * Which wrapper feeds each kind of page. This is the switch for data
 * sources: to move a page onto the API, write its XPage.query.tsx beside the
 * fixtures wrapper and point its line here at it. The page doesn't change.
 */
const wrappers: Record<PageType, ComponentType<{ route: Route }>> = {
  dashboard: OverviewPageQuery,
  list: SystemsPageQuery,
  detail: SystemPageQuery,
  table: HistoryPageQuery,
  catalog: ServicesPageQuery,
  projects: ProjectsPageQuery,
  project: ProjectPageQuery,
  "project-workflows": ProjectWorkflowsPageQuery,
  "project-components": ProjectComponentsPageQuery,
  "project-create": ProjectCreatePageQuery,
  "project-sandboxes": ProjectSandboxesPageQuery,
  "project-settings": ProjectSettingsPageQuery,
  service: ServicePageQuery,
  component: ComponentPageQuery,
  status: StatusPageFixtures,
  insights: InsightsPageQuery,
  "user-settings": UserSettingsPageQuery,
  "organization-settings": OrganizationSettingsPageQuery,
  "admin-settings": AdminSettingsPageQuery,
  handbook: HandbookPageQuery,
  generic: PlaceholderPageQuery,
};

/**
 * Pages that moved, so old links still land somewhere. Instance settings
 * folded into Organization settings, and Collaboration became Members.
 */
const movedPaths: Record<string, string> = {
  "/instance-settings": "/organization-settings",
  "/instance-settings/collaboration": "/organization-settings/members",
  "/instance-settings/billing": "/organization-settings/billing",
  "/instance-settings/context": "/organization-settings/context",
};

/**
 * Shows the page at the current URL: finds where it sits in the IA tree and
 * hands the route to the wrapper for that kind of page. Overview, the home
 * page, sits at "/" outside the tree; with the Organizations flag off, home
 * is the projects list. A page whose feature flag is off says so. Admin
 * settings only exist for a superuser, so they wait until the API says
 * whether you are one.
 */
export default function PageRoute() {
  const { pathname, search, hash } = useLocation();
  const flags = useFlags();
  const { isSuperuser, userError } = useShell();

  // Projects are named by their id on the API now; an old link by the fixture's slug still lands.
  const slug = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  if (slug && fixtureProjects.some((p) => p.id === slug)) {
    return <Navigate to={`${pathname.replace(`/projects/${slug}`, `/projects/${apiProjectId(slug)}`)}${search}${hash}`} replace />;
  }

  // So are connected systems; an old link names one by its slug ("dhis2"), which is never a UUID.
  const system = findNodeByPath(iaTree, pathname)?.params["connected-system"];
  if (system && !isUuid(system)) {
    return <Navigate to={`${pathname.replace(`/connected-systems/${system}`, `/connected-systems/${apiSystemId(system)}`)}${search}${hash}`} replace />;
  }

  if (pathname === "/" || pathname === "/overview") {
    return flags.organizations ? <OverviewPageQuery /> : <Navigate to="/projects" replace />;
  }

  const moved = movedPaths[pathname.replace(/\/$/, "")];
  if (moved) return <Navigate to={moved} replace />;

  const result = findNodeByPath(treeForViewer(visibleTree(iaTree, flags), isSuperuser ?? false), pathname);
  if (!result) {
    // Admin settings wait until the API has said whether you're a superuser, and say why if it couldn't.
    if (isSuperuser === undefined && findNodeByPath(visibleTree(iaTree, flags), pathname)) {
      return userError ? (
        <Callout variant="danger" title="This page couldn't load">
          {userError}
        </Callout>
      ) : (
        <LoadingState />
      );
    }
    const hidden = findNodeByPath(treeForViewer(iaTree, isSuperuser ?? false), pathname);
    const flag = hidden && [...hidden.ancestors.map((a) => a.node), hidden.node].find((n) => n.flag && !flags[n.flag])?.flag;
    return flag ? (
      <NotFoundPage path={pathname} reason="flag" feature={flagById(flag).label} />
    ) : (
      <NotFoundPage path={pathname} reason="page" />
    );
  }

  const Wrapper = wrappers[result.node.pageType ?? "generic"];
  return <Wrapper route={{ ...result, currentPath: pathname }} />;
}
