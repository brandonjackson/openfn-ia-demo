import type { PickerItem } from "./Picker";
import { projects, type Project } from "../../mock-data/projects";

/**
 * Where switching to `projectId` should land from the current URL
 * (Lightning's `project_picker_target`): the same section where it exists,
 * the nearest index for detail pages, otherwise the workflow list.
 */
export function projectPickerTarget(projectId: string, currentPath: string) {
  const parts = currentPath.split("/").filter(Boolean);
  let section = "w";
  let sameSection = false;
  if (parts[0] === "projects" && parts.length >= 3) {
    const s = parts[2];
    if (s === "runs" || s === "dataclips") section = "history";
    else if (["w", "history", "channels", "sandboxes", "settings", "jobs"].includes(s)) {
      section = s;
      sameSection = true;
    }
  }
  return { href: `/projects/${projectId}/${section}`, sameSection };
}

/** The project tree, flattened in pre-order (Lightning's `build_project_picker_items`). */
export function buildProjectPickerItems(currentPath: string, all: Project[] = projects): PickerItem[] {
  const out: PickerItem[] = [];
  const walk = (parentId: string | null, depth: number, parentLabel: string) => {
    all
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((p) => {
        const label = parentLabel ? `${parentLabel}/${p.name}` : p.name;
        const { href, sameSection } = projectPickerTarget(p.id, currentPath);
        out.push({
          id: p.id,
          label: p.name,
          searchLabel: label,
          depth,
          color: p.color,
          href,
          sameSection,
          isSandbox: p.parentId !== null,
        });
        walk(p.id, depth + 1, label);
      });
  };
  walk(null, 0, "");
  return out;
}

/** "parent/child" label for a project, as shown on the picker button. */
export function projectLabel(project: Project, all: Project[] = projects): string {
  const names: string[] = [];
  let p: Project | undefined = project;
  while (p) {
    names.unshift(p.name);
    p = all.find((x) => x.id === p!.parentId);
  }
  return names.join("/");
}
