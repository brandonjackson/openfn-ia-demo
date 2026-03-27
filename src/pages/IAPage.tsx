import { useLocation } from "react-router-dom";
import { iaTree } from "../ia-tree";
import { findNodeByPath } from "../ia-utils";
import PageShell from "../components/PageShell";

export default function IAPage() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/") {
    return <HomePage />;
  }

  const result = findNodeByPath(iaTree, pathname);

  if (!result) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-500">
          No IA node found for <code className="bg-gray-100 px-2 py-0.5 rounded">{pathname}</code>
        </p>
      </div>
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
      <h1 className="text-2xl font-semibold text-gray-900">
        OpenFN Information Architecture
      </h1>
      <p className="mt-2 text-gray-500">
        Click any item in the sidebar to explore the IA. Each page shows its
        sub-pages and placeholder content.
      </p>
      <p className="mt-4 text-sm text-gray-400">
        To iterate on the structure, edit{" "}
        <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
          src/ia-tree.ts
        </code>
        — the entire site regenerates from that single file.
      </p>
    </div>
  );
}
