import { Link } from "react-router-dom";
import { Boxes, ChevronRight, ClipboardList, Plus } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectPageData, ProjectServiceItem } from "../page-data";
import Badge from "../components/Badge";
import Breadcrumbs from "../components/Breadcrumbs";
import ComponentRow from "../components/ComponentRow";
import { componentTypes } from "../component-types";
import { mockEntries } from "../mock-data";

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

function AddComponentInput() {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100">
        <Plus size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-400">Add a component</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {componentTypes.map(({ type, icon: Icon, description }) => {
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
                  {description}
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
          to={`${currentPath}/history?type=Work+Order`}
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
              Published Services
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
              No published services yet. Create one to list it in Services.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Boxes size={16} className="text-gray-400" />
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
            <ComponentRow key={comp.id} component={comp} projectPath={currentPath} />
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
    </div>
  );
}
