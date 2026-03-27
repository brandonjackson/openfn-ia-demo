import { useLocation } from "react-router-dom";
import { iaTree } from "../ia-tree";
import { findNodeByPath } from "../ia-utils";
import { pageDataRegistry } from "../mock-data";
import { connectedSystems } from "../mock-data/connected-systems";
import { templateMap } from "../templates";
import PageShell from "../components/PageShell";
import type { DashboardPageData, DetailPageData } from "../page-data";
import DashboardTemplate from "../templates/DashboardTemplate";

/**
 * Build DetailPageData on the fly from the connectedSystems array.
 * No per-system data file required.
 */
function buildSystemDetailData(systemId: string): DetailPageData | undefined {
  const system = connectedSystems.find((s) => s.id === systemId);
  if (!system) return undefined;

  return {
    pageType: "detail",
    headerBadge: {
      label: system.credentialType === "org" ? "Shared" : "Private",
      variant: system.credentialType === "org" ? "shared" : "private",
    },
    systemId: system.id,
    sections: [],
  };
}

export default function IAPage() {
  const location = useLocation();
  const pathname = location.pathname;

  // Dashboard / home page
  if (pathname === "/" || pathname === "/overview") {
    const data = pageDataRegistry.get("overview") as DashboardPageData;
    return <DashboardTemplate data={data} />;
  }

  const result = findNodeByPath(iaTree, pathname);

  if (!result) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-500">
          No IA node found for{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded">{pathname}</code>
        </p>
      </div>
    );
  }

  const pageType = result.node.pageType ?? "generic";
  const Template = templateMap[pageType];

  if (Template) {
    // For dynamic nodes, build data from the source array; otherwise use registry
    let data = result.dynamicSlug
      ? buildSystemDetailData(result.dynamicSlug)
      : pageDataRegistry.get(result.node.id);

    // Override node label with actual system name for dynamic routes
    const node = result.dynamicSlug
      ? {
          ...result.node,
          label:
            connectedSystems.find((s) => s.id === result.dynamicSlug)?.name ??
            result.node.label,
        }
      : result.node;

    if (!data && result.dynamicSlug) {
      return (
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-gray-500">
            No connected system found for{" "}
            <code className="bg-gray-100 px-2 py-0.5 rounded">{result.dynamicSlug}</code>
          </p>
        </div>
      );
    }

    return (
      <Template
        node={node}
        ancestors={result.ancestors}
        currentPath={pathname}
        data={data}
      />
    );
  }

  // Fallback to generic PageShell
  return (
    <PageShell
      node={result.node}
      ancestors={result.ancestors}
      currentPath={pathname}
    />
  );
}
