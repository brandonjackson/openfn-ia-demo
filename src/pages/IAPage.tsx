import { useLocation } from "react-router-dom";
import { iaTree } from "../ia-tree";
import { findNodeByPath } from "../ia-utils";
import { pageDataRegistry } from "../mock-data";
import { templateMap } from "../templates";
import PageShell from "../components/PageShell";
import type { DashboardPageData } from "../page-data";
import DashboardTemplate from "../templates/DashboardTemplate";

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
    const data = pageDataRegistry.get(result.node.id);
    return (
      <Template
        node={result.node}
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
