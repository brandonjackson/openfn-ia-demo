import { Link } from "react-router-dom";
import { ChevronRight, FileText, Boxes, Sparkles, Database } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IANode } from "../ia-tree";
import Badge from "./Badge";
import Breadcrumbs from "./Breadcrumbs";

const resourceIcons: Record<string, LucideIcon> = {
  artifacts: FileText,
  skills: Sparkles,
  collections: Database,
};

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
}

function WorkflowCard({ node, basePath }: { node: IANode; basePath: string }) {
  const to = basePath + "/" + node.id;
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
          {node.label}
        </h3>
        {node.badges?.map((b) => <Badge key={b} label={b} />)}
      </div>
      <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-blue-400"
      />
    </Link>
  );
}

function ResourceCard({ node, basePath }: { node: IANode; basePath: string }) {
  const to = basePath + "/" + node.id;
  const Icon = resourceIcons[node.id] || Boxes;
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50">
        <Icon size={16} className="text-gray-400 group-hover:text-blue-500" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
          {node.label}
        </h3>
        {node.description && (
          <p className="text-xs text-gray-500 mt-0.5">{node.description}</p>
        )}
      </div>
    </Link>
  );
}

export default function ProjectRootView({
  node,
  ancestors,
  currentPath,
}: Props) {
  // Split children into workflows (services, sandbox) and resources
  const workflows =
    node.children?.filter(
      (c) =>
        c.id.startsWith("service-") || c.id === "sandbox" || c.id === "work-orders"
    ) || [];
  // Show resource type children (artifacts, skills, collections) directly
  const resourcesNode = node.children?.find((c) => c.id === "resources");
  const resources = resourcesNode?.children || [];

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({
          label: a.node.label,
          path: a.path,
        }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && (
          <p className="mt-1 text-gray-500 text-sm">{node.description}</p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Workflows */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Workflows
            </h2>
          </div>
          <div className="space-y-2">
            {workflows.map((child) => (
              <WorkflowCard
                key={child.id}
                node={child}
                basePath={currentPath}
              />
            ))}
            {workflows.length === 0 && (
              <p className="text-sm text-gray-400 italic">No workflows yet.</p>
            )}
          </div>
        </div>

        {/* Right column: Resources */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Boxes size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Resources
            </h2>
          </div>
          <div className="space-y-2">
            {resources.map((child) => (
              <ResourceCard
                key={child.id}
                node={child}
                basePath={currentPath + "/resources"}
              />
            ))}
            {resources.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                No resources yet. Upload artifacts and collections here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
