import { useLocation } from "react-router-dom";
import { iaTree } from "../ia-tree";
import { projectsTree } from "../ia-tree";
import { findNodeByPath } from "../ia-utils";
import PageShell from "../components/PageShell";
import ProjectRootView from "../components/ProjectRootView";
import ConnectedSystemsView from "../components/ConnectedSystemsView";
import HistoryView from "../components/HistoryView";
import OpenCRVSSystemView from "../components/OpenCRVSSystemView";
import HomeView from "../components/HomeView";
import ServiceCatalogView from "../components/ServiceCatalogView";

export default function IAPage() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/" || pathname === "/overview") {
    return <HomeView />;
  }

  const result = findNodeByPath(iaTree, pathname);

  if (!result) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">
          Page Not Found
        </h1>
        <p className="mt-2 text-gray-500">
          No IA node found for{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded">{pathname}</code>
        </p>
      </div>
    );
  }

  // Check if this is a project root (direct child of /projects)
  const isProjectRoot =
    result.ancestors.length === 1 &&
    result.ancestors[0].node.id === "projects" &&
    projectsTree.some((p) => p.id === result.node.id);

  if (isProjectRoot) {
    return (
      <ProjectRootView
        node={result.node}
        ancestors={result.ancestors}
        currentPath={pathname}
      />
    );
  }

  if (result.node.id === "connected-systems") {
    return (
      <ConnectedSystemsView
        node={result.node}
        ancestors={result.ancestors}
        currentPath={pathname}
      />
    );
  }

  if (result.node.id === "service-catalog") {
    return (
      <ServiceCatalogView
        node={result.node}
        ancestors={result.ancestors}
        currentPath={pathname}
      />
    );
  }

  if (result.node.id === "opencrvs") {
    return (
      <OpenCRVSSystemView
        node={result.node}
        ancestors={result.ancestors}
        currentPath={pathname}
      />
    );
  }

  if (result.node.id === "history") {
    return (
      <HistoryView
        node={result.node}
        ancestors={result.ancestors}
      />
    );
  }

  return (
    <PageShell
      node={result.node}
      ancestors={result.ancestors}
      currentPath={pathname}
    />
  );
}
