import { type ProjectComponentItem, componentTypeIcons } from "../../model/component-types";
import Badge from "../primitives/Badge";
import ListRow from "../primitives/ListRow";
import NavItem from "../primitives/NavItem";

interface Props {
  component: ProjectComponentItem;
  /** The project's URL, e.g. `/projects/project-a`. */
  projectPath: string;
  /** Show the component's description under its name. */
  showDescription?: boolean;
  /** Hide the type tag, e.g. when rows are already grouped by type. */
  hideType?: boolean;
  /**
   * `tree` (the default) is a compact row in a card of them, as on a
   * project's Overview; `row` is a full-width `ListRow`, as on the
   * Components page, opening on click with a ⋮ menu that starts with Open.
   */
  variant?: "tree" | "row";
}

/**
 * One row in a list of project components. Workflows open straight into the
 * workflow editor; everything else opens its detail page.
 */
export default function ComponentRow({ component, projectPath, showDescription = false, hideType = false, variant = "tree" }: Props) {
  const to =
    component.type === "Workflow"
      ? "/workflow-editor/" + component.id
      : projectPath + "/components/" + component.id;

  if (variant === "row") {
    return (
      <ListRow
        to={to}
        icon={componentTypeIcons[component.type]}
        title={component.name}
        badges={!hideType && <Badge label={component.type} shape="tag" />}
        description={showDescription ? component.description || undefined : undefined}
        menu={{}}
      />
    );
  }

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
