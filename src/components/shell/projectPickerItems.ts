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

/**
 * The items whose `searchLabel` contains `term`, plus the ancestors that
 * lead to each match so the indentation still reads (Lightning's picker
 * filter). `items` must be in pre-order, as `buildProjectPickerItems` gives.
 */
export function filterPickerItems(items: PickerItem[], term: string): PickerItem[] {
  if (!term) return items;
  const lower = term.toLowerCase();
  const include = items.map((i) => i.searchLabel.toLowerCase().includes(lower));
  items.forEach((item, i) => {
    if (!item.searchLabel.toLowerCase().includes(lower)) return;
    // The parent is the most recent item with a strictly smaller depth.
    let depth = item.depth;
    for (let j = i - 1; j >= 0 && depth > 0; j--) {
      if (items[j].depth < depth) {
        include[j] = true;
        depth = items[j].depth;
      }
    }
  });
  return items.filter((_, i) => include[i]);
}
