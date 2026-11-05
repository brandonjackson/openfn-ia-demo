import type { ProjectComponentItem } from "../../model/page-data";
import { componentTypeIcons } from "../../model/component-types";
import Badge from "../primitives/Badge";
import NavItem from "../primitives/NavItem";

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

  return (
    <NavItem
      variant="tree"
      to={to}
      icon={componentTypeIcons[component.type]}
      label={component.name}
      description={showDescription ? component.description : undefined}
      trailing={!hideType && <Badge label={component.type} shape="tag" />}
    />
  );
}
