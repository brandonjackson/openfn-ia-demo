import { Link } from "react-router-dom";
import {
  ChevronRight,
  FileText,
  Workflow,
  Database,
  FileSpreadsheet,
  ClipboardList,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectPageData, ProjectServiceItem, ProjectComponentItem } from "../page-data";
import Badge from "../components/Badge";
import Breadcrumbs from "../components/Breadcrumbs";
import { mockEntries } from "../mock-data";

const componentTypeIcons: Record<string, LucideIcon> = {
  Workflow: Workflow,
  Artifact: FileText,
  Form: FileSpreadsheet,
  Collection: Database,
};

function ServiceCard({ service, basePath }: { service: ProjectServiceItem; basePath: string }) {
  const to = basePath + "/services/" + service.id;
  return (
    <Link
      to={to}
      className="group block rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
            {service.name}
          </h3>
          <Badge label={service.status} />
        </div>
        <ChevronRight
          size={16}
          className="text-gray-300 group-hover:text-blue-400"
        />
      </div>
      {service.description && (
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
          {service.description}
        </p>
      )}
    </Link>
  );
}

function ComponentRow({ component, basePath }: { component: ProjectComponentItem; basePath: string }) {
  const to = basePath + "/components/" + component.id;
  const Icon = componentTypeIcons[component.type] || FileText;

  return (
    <Link
      to={to}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <Icon
        size={16}
        className="text-gray-400 group-hover:text-blue-500 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-900 group-hover:text-blue-600 font-mono truncate block">
          {component.name}
        </span>
      </div>
      <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 flex-shrink-0">
        {component.type}
      </span>
    </Link>
  );
}

const componentTypeDescriptions: Record<string, string> = {
  Workflow: "Automated data pipeline or integration",
  Form: "Data entry or collection form",
  Artifact: "Configuration file or mapping",
  Collection: "Structured dataset or lookup table",
};

function AddComponentInput() {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100">
        <Plus size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-400">Add a component</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {["Workflow", "Form", "Artifact", "Collection"].map((type) => {
          const Icon = componentTypeIcons[type] || FileText;
          return (
            <button
              key={type}
              className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
            >
              <Icon
                size={16}
                className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {type}
                </div>
                <div className="text-xs text-gray-400 leading-snug mt-0.5">
                  {componentTypeDescriptions[type]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectPageData;
}

export default function ProjectTemplate({ node, ancestors, currentPath, data }: Props) {
  const services = data.services;
  const components = data.components;

  const workOrderCount = mockEntries.filter(
    (e) => e.type === "Work Order" && e.project === node.label
  ).length;

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && (
          <p className="mt-1 text-gray-500 text-sm">{node.description}</p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to={`/history?project=${encodeURIComponent(node.label)}&type=Work+Order`}
          className="group rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
            Work Orders
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {workOrderCount}
          </p>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Services
            </h2>
          </div>
          <button className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors">
            <Plus size={14} />
            New Service
          </button>
        </div>
        <div className="space-y-2">
          {services.map((svc) => (
            <ServiceCard key={svc.id} service={svc} basePath={currentPath} />
          ))}
          {services.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              No services yet. Create one to publish to the Service Catalog.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Components
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {components.length} item{components.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {components.map((comp) => (
            <ComponentRow key={comp.id} component={comp} basePath={currentPath} />
          ))}
          {components.length === 0 && (
            <p className="text-sm text-gray-400 italic px-3 py-4">
              No components yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <AddComponentInput />
      </div>

      {/* Work Orders link */}
      <div className="mt-8">
        <div className="space-y-2">
          <Link
            to={currentPath + "/work-orders"}
            className="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
                Work Orders
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                View and manage work orders for this project.
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-gray-300 group-hover:text-blue-400"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
