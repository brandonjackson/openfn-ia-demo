import { Link } from "react-router-dom";
import type { ProjectComponentItem } from "../page-data";
import { componentTypeIcons } from "../component-types";

interface Props {
  component: ProjectComponentItem;
  /** The project's URL, e.g. `/projects/project-a`. */
  projectPath: string;
  /** Show the component's description under its name. */
  showDescription?: boolean;
  /** Hide the type tag, e.g. when rows are already grouped by type. */
  hideType?: boolean;
}

/**
 * One row in a list of project components. Workflows open straight into the
 * workflow editor; everything else opens its detail page.
 */
export default function ComponentRow({ component, projectPath, showDescription = false, hideType = false }: Props) {
  const to =
    component.type === "Workflow"
      ? "/workflow-editor/" + component.id
      : projectPath + "/components/" + component.id;
  const Icon = componentTypeIcons[component.type];

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <Icon size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-900 group-hover:text-blue-600 font-mono truncate block">
          {component.name}
        </span>
        {showDescription && component.description && (
          <span className="mt-0.5 text-xs text-gray-500 truncate block">{component.description}</span>
        )}
      </div>
      {!hideType && (
        <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 flex-shrink-0">
          {component.type}
        </span>
      )}
    </Link>
  );
}
