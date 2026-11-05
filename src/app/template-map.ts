import type React from "react";
import type { IANode } from "../model/ia-tree";
import type { PageData } from "../model/page-data";
import SystemsPage from "../pages/SystemsPage";
import SystemPage from "../pages/SystemPage";
import HistoryPage from "../pages/HistoryPage";
import ServicesPage from "../pages/ServicesPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectPage from "../pages/ProjectPage";
import ProjectWorkflowsPage from "../pages/ProjectWorkflowsPage";
import ProjectComponentsPage from "../pages/ProjectComponentsPage";
import ProjectCreatePage from "../pages/ProjectCreatePage";
import ProjectSandboxesPage from "../pages/ProjectSandboxesPage";
import ProjectSettingsPage from "../pages/ProjectSettingsPage";
import ServicePage from "../pages/ServicePage";
import ChannelPage from "../pages/ChannelPage";
import OverviewPage from "../pages/OverviewPage";
import StatusPage from "../pages/StatusPage";
import InsightsPage from "../pages/InsightsPage";
import UserSettingsPage from "../pages/UserSettingsPage";
import InstanceSettingsPage from "../pages/InstanceSettingsPage";
import OrganizationSettingsPage from "../pages/OrganizationSettingsPage";
import HandbookPage from "../pages/HandbookPage";

export interface TemplateProps {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data?: PageData;
}

// Each template is typed to its specific data shape internally,
// but we register them under a common interface here for the dispatcher.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const templateMap: Record<string, React.FC<any>> = {
  list: SystemsPage,
  detail: SystemPage,
  table: HistoryPage,
  catalog: ServicesPage,
  projects: ProjectsPage,
  project: ProjectPage,
  "project-workflows": ProjectWorkflowsPage,
  "project-components": ProjectComponentsPage,
  "project-create": ProjectCreatePage,
  "project-sandboxes": ProjectSandboxesPage,
  "project-settings": ProjectSettingsPage,
  service: ServicePage,
  channel: ChannelPage,
  dashboard: OverviewPage,
  status: StatusPage,
  insights: InsightsPage,
  "user-settings": UserSettingsPage,
  "instance-settings": InstanceSettingsPage,
  "organization-settings": OrganizationSettingsPage,
  handbook: HandbookPage,
};
