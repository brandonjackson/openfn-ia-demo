import type { PageRoute } from "./ia-utils";
import type { IANode, PageProps } from "../model/ia-tree";

/*
 * What every wrapper hands its page about where it sits: the IA node, the
 * crumbs above it and the path. Answered from the route and what the wrapper
 * loaded, never from fixtures.
 */

/**
 * The crumbs above a page. Inside a project, the project's crumb shows the
 * name the wrapper loaded, and "Services", which has no page of its own, goes
 * to the Services catalog instead.
 */
export function crumbs(route: PageRoute, projectName?: string): PageRoute["ancestors"] {
  const projectId = route.params["project"];
  return route.ancestors.map((a) => {
    if (a.node.id === "project" && projectName) {
      return { ...a, node: { ...a.node, label: projectName } };
    }
    if (a.node.id === "services" && projectId) {
      return { ...a, path: "/service-catalog" };
    }
    return a;
  });
}

/**
 * Everything a page is handed about where it sits, ready to spread into it:
 * `<XPage {...pageFrame(route)} data={…} />`. Pass `node` to rename the page
 * after the record it shows (a project, a system), and, inside a project, the
 * project's name as the API has it, so a renamed project is named right.
 */
export function pageFrame(route: PageRoute, node: Partial<IANode> = {}, projectName?: string): Omit<PageProps<never>, "data"> {
  return {
    node: { ...route.node, ...node },
    ancestors: crumbs(route, projectName),
    currentPath: route.currentPath,
  };
}
