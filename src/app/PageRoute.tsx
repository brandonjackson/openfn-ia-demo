import type { ComponentType } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { iaTree, type IANode } from "../model/ia-tree";
import { findNodeByPath, type PageRoute as Route } from "./ia-utils";
import NotFoundPage from "../pages/NotFoundPage";
import OverviewPageFixtures from "../pages/OverviewPage.fixtures";
import SystemsPageFixtures from "../pages/SystemsPage.fixtures";
import SystemPageFixtures from "../pages/SystemPage.fixtures";
import HistoryPageFixtures from "../pages/HistoryPage.fixtures";
import ServicesPageFixtures from "../pages/ServicesPage.fixtures";
import ProjectsPageFixtures from "../pages/ProjectsPage.fixtures";
import ProjectPageFixtures from "../pages/ProjectPage.fixtures";
import ProjectWorkflowsPageFixtures from "../pages/ProjectWorkflowsPage.fixtures";
import ProjectComponentsPageFixtures from "../pages/ProjectComponentsPage.fixtures";
import ProjectCreatePageFixtures from "../pages/ProjectCreatePage.fixtures";
import ProjectSandboxesPageFixtures from "../pages/ProjectSandboxesPage.fixtures";
import ProjectSettingsPageFixtures from "../pages/ProjectSettingsPage.fixtures";
import ServicePageFixtures from "../pages/ServicePage.fixtures";
import ChannelPageFixtures from "../pages/ChannelPage.fixtures";
import StatusPageFixtures from "../pages/StatusPage.fixtures";
import InsightsPageFixtures from "../pages/InsightsPage.fixtures";
import UserSettingsPageFixtures from "../pages/UserSettingsPage.fixtures";
import OrganizationSettingsPageFixtures from "../pages/OrganizationSettingsPage.fixtures";
import HandbookPageFixtures from "../pages/HandbookPage.fixtures";
import PlaceholderPageFixtures from "../pages/PlaceholderPage.fixtures";

type PageType = NonNullable<IANode["pageType"]>;

/**
 * Which wrapper feeds each kind of page. This is the switch for data
 * sources: to move a page onto the API, write its XPage.query.tsx beside the
 * fixtures wrapper and point its line here at it. The page doesn't change.
 */
const wrappers: Record<PageType, ComponentType<{ route: Route }>> = {
  dashboard: OverviewPageFixtures,
  list: SystemsPageFixtures,
  detail: SystemPageFixtures,
  table: HistoryPageFixtures,
  catalog: ServicesPageFixtures,
  projects: ProjectsPageFixtures,
  project: ProjectPageFixtures,
  "project-workflows": ProjectWorkflowsPageFixtures,
  "project-components": ProjectComponentsPageFixtures,
  "project-create": ProjectCreatePageFixtures,
  "project-sandboxes": ProjectSandboxesPageFixtures,
  "project-settings": ProjectSettingsPageFixtures,
  service: ServicePageFixtures,
  channel: ChannelPageFixtures,
  status: StatusPageFixtures,
  insights: InsightsPageFixtures,
  "user-settings": UserSettingsPageFixtures,
  "organization-settings": OrganizationSettingsPageFixtures,
  handbook: HandbookPageFixtures,
  generic: PlaceholderPageFixtures,
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
 * page, sits at "/" outside the tree.
 */
export default function PageRoute() {
  const { pathname } = useLocation();

  if (pathname === "/" || pathname === "/overview") return <OverviewPageFixtures />;

  const moved = movedPaths[pathname.replace(/\/$/, "")];
  if (moved) return <Navigate to={moved} replace />;

  const result = findNodeByPath(iaTree, pathname);
  if (!result) return <NotFoundPage path={pathname} reason="page" />;

  const Wrapper = wrappers[result.node.pageType ?? "generic"];
  return <Wrapper route={{ ...result, currentPath: pathname }} />;
}
