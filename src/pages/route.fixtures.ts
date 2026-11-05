import type { PageRoute } from "../app/ia-utils";
import type { IANode, PageProps } from "../model/ia-tree";
import type { Project } from "../model/projects";
import { fixtureProject } from "../fixtures/projects";

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
  const id = route.params["project"];
  if (!id) return undefined;
  // The URL holds the project's id on the API; pages not yet on the API read its fixture.
  return fixtureProject(id) ?? null;
}

/**
 * The crumbs above a page. Inside a project, the project's crumb shows the
 * project's real name, and "Services", which has no page of its own, goes to
 * the Services catalog instead.
 */
export function crumbs(route: PageRoute, name?: string): PageRoute["ancestors"] {
  const projectSlug = route.params["project"];
  const projectName = name ?? fixtureProject(projectSlug)?.name;
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
 * after the record it shows (a project, a system). A wrapper on the API passes
 * the project's name as the API has it, so a renamed project is named right.
 */
export function pageFrame(route: PageRoute, node: Partial<IANode> = {}, projectName?: string): Omit<PageProps<never>, "data"> {
  return {
    node: { ...route.node, ...node },
    ancestors: crumbs(route, projectName),
    currentPath: route.currentPath,
  };
}
