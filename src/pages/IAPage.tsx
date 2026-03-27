import { useLocation } from "react-router-dom";
import { iaTree } from "../ia-tree";
import { projectsTree } from "../ia-tree";
import { findNodeByPath } from "../ia-utils";
import PageShell from "../components/PageShell";
import ProjectRootView from "../components/ProjectRootView";
import ConnectedSystemsView from "../components/ConnectedSystemsView";
import HistoryView from "../components/HistoryView";
import OpenCRVSSystemView from "../components/OpenCRVSSystemView";

export default function IAPage() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/" || pathname === "/overview") {
    return <HomePage />;
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

function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <p className="mt-2 text-gray-500">
        Welcome to OpenFn. View system health, recent activity, and key metrics
        at a glance.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Active Services</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">12</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Work Orders (24h)</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">347</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Connected Systems</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">8</p>
        </div>
      </div>
      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
        Dashboard content goes here.
      </div>
    </div>
  );
}
