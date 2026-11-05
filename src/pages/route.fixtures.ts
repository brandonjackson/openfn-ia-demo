import type { PageRoute } from "../app/ia-utils";
import type { IANode, PageProps } from "../model/ia-tree";
import type { Project } from "../model/projects";
import { projects } from "../fixtures/projects";

/*
 * What the page wrappers share about where a page sits, answered from
 * fixtures: which project a route is inside, and what its crumbs are called.
 * A wrapper on another data source answers the same questions from there.
 */

/**
 * The project named in the URL: `undefined` outside a project, and `null`
 * when the URL names a project that doesn't exist (the wrapper then shows
 * Not Found).
 */
export function routeProject(route: PageRoute): Project | null | undefined {
  const slug = route.params["project"];
  if (!slug) return undefined;
  return projects.find((p) => p.id === slug) ?? null;
}

/**
 * The crumbs above a page. Inside a project, the project's crumb shows the
 * project's real name, and "Services", which has no page of its own, goes to
 * the Services catalog instead.
 */
export function crumbs(route: PageRoute): PageRoute["ancestors"] {
  const projectSlug = route.params["project"];
  const projectName = projects.find((p) => p.id === projectSlug)?.name;
  return route.ancestors.map((a) => {
    if (a.node.id === "project" && projectName) {
      return { ...a, node: { ...a.node, label: projectName } };
    }
    if (a.node.id === "services" && projectSlug) {
      return { ...a, path: "/service-catalog" };
    }
    return a;
  });
}

/**
 * Everything a page is handed about where it sits, ready to spread into it:
 * `<XPage {...pageFrame(route)} data={…} />`. Pass `node` to rename the page
 * after the record it shows (a project, a system).
 */
export function pageFrame(route: PageRoute, node: Partial<IANode> = {}): Omit<PageProps<never>, "data"> {
  return {
    node: { ...route.node, ...node },
    ancestors: crumbs(route),
    currentPath: route.currentPath,
  };
}
