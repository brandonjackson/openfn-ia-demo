import type React from "react";
import type { IANode } from "../ia-tree";
import type { PageData } from "../page-data";
import ListTemplate from "./ListTemplate";
import DetailTemplate from "./DetailTemplate";
import TableTemplate from "./TableTemplate";
import CatalogTemplate from "./CatalogTemplate";
import ProjectsTemplate from "./ProjectsTemplate";
import ProjectTemplate from "./ProjectTemplate";
import ProjectWorkflowsTemplate from "./ProjectWorkflowsTemplate";
import ProjectSettingsTemplate from "./ProjectSettingsTemplate";
import DashboardTemplate from "./DashboardTemplate";
import StatusTemplate from "./StatusTemplate";
import InsightsTemplate from "./InsightsTemplate";
import UserSettingsTemplate from "./UserSettingsTemplate";
import HandbookTemplate from "./HandbookTemplate";

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
  list: ListTemplate,
  detail: DetailTemplate,
  table: TableTemplate,
  catalog: CatalogTemplate,
  projects: ProjectsTemplate,
  project: ProjectTemplate,
  "project-workflows": ProjectWorkflowsTemplate,
  "project-settings": ProjectSettingsTemplate,
  dashboard: DashboardTemplate,
  status: StatusTemplate,
  insights: InsightsTemplate,
  "user-settings": UserSettingsTemplate,
  handbook: HandbookTemplate,
};
