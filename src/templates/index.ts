import type React from "react";
import type { IANode } from "../ia-tree";
import type { PageData } from "../page-data";
import ListTemplate from "./ListTemplate";
import DetailTemplate from "./DetailTemplate";
import TableTemplate from "./TableTemplate";
import CatalogTemplate from "./CatalogTemplate";
import ProjectTemplate from "./ProjectTemplate";
import ProjectSettingsTemplate from "./ProjectSettingsTemplate";
import DashboardTemplate from "./DashboardTemplate";

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
  project: ProjectTemplate,
  "project-settings": ProjectSettingsTemplate,
  dashboard: DashboardTemplate,
};
