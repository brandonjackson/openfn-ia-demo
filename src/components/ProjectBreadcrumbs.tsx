import type { ReactNode } from "react";
import type { Project } from "../mock-data/projects";
import { Breadcrumb, BreadcrumbPicker, Breadcrumbs } from "./Breadcrumbs";
import PickerButton from "./PickerButton";
import { projectLabel } from "./projectPickerItems";

interface Props {
  project: Project;
  /** Crumbs between the project and the page, e.g. [["History", "/projects/x/history"]]. */
  items?: [label: string, to: string][];
  /** The current page's crumb (not a link). */
  current?: ReactNode;
}

/** Breadcrumbs for a project page: the project picker, then the trail. */
export default function ProjectBreadcrumbs({ project, items = [], current }: Props) {
  return (
    <Breadcrumbs>
      <BreadcrumbPicker>
        <PickerButton label={projectLabel(project)} isSandbox={project.parentId !== null} color={project.color} />
      </BreadcrumbPicker>
      {items.map(([label, to]) => (
        <Breadcrumb key={to} to={to}>
          {label}
        </Breadcrumb>
      ))}
      {current && <Breadcrumb>{current}</Breadcrumb>}
    </Breadcrumbs>
  );
}
