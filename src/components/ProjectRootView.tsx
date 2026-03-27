import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  FileText,
  Workflow,
  Database,
  FileSpreadsheet,
  ClipboardList,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IANode } from "../ia-tree";
import Badge from "./Badge";
import Breadcrumbs from "./Breadcrumbs";

/* ------------------------------------------------------------------ */
/*  Icon mapping for component types                                    */
/* ------------------------------------------------------------------ */

const componentTypeIcons: Record<string, LucideIcon> = {
  Workflow: Workflow,
  Artifact: FileText,
  Form: FileSpreadsheet,
  Collection: Database,
};

/* ------------------------------------------------------------------ */
/*  Service card                                                        */
/* ------------------------------------------------------------------ */

function ServiceCard({
  node,
  basePath,
}: {
  node: IANode;
  basePath: string;
}) {
  const to = basePath + "/services/" + node.id;
  return (
    <Link
      to={to}
      className="group block rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
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
      </div>
      {node.description && (
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
          {node.description}
        </p>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Component row (file-list style)                                     */
/* ------------------------------------------------------------------ */

function ComponentRow({
  node,
  basePath,
}: {
  node: IANode;
  basePath: string;
}) {
  const to = basePath + "/components/" + node.id;
  const typeBadge = node.badges?.[0] || "File";
  const Icon = componentTypeIcons[typeBadge] || FileText;

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
          {node.label}
        </span>
      </div>
      <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 flex-shrink-0">
        {typeBadge}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Add component input (chatbot-style)                                 */
/* ------------------------------------------------------------------ */

function AddComponentInput() {
  const [value, setValue] = useState("");

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100">
        <Sparkles size={14} className="text-purple-400" />
        <span className="text-xs font-medium text-gray-400">
          Add a component
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe a workflow, form, artifact, or collection to add…"
          className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
        />
        <button
          className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!value.trim()}
        >
          <Send size={14} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-gray-100">
        {["Workflow", "Form", "Artifact", "Collection"].map((type) => {
          const Icon = componentTypeIcons[type] || FileText;
          return (
            <button
              key={type}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            >
              <Icon size={12} />
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main project view                                                   */
/* ------------------------------------------------------------------ */

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
}

export default function ProjectRootView({
  node,
  ancestors,
  currentPath,
}: Props) {
  const servicesNode = node.children?.find((c) => c.id === "services");
  const services = servicesNode?.children || [];

  const componentsNode = node.children?.find((c) => c.id === "components");
  const components = componentsNode?.children || [];

  // Other top-level children (work orders, etc.)
  const otherChildren =
    node.children?.filter(
      (c) => c.id !== "services" && c.id !== "components"
    ) || [];

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

      {/* Services */}
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
          {services.map((child) => (
            <ServiceCard
              key={child.id}
              node={child}
              basePath={currentPath}
            />
          ))}
          {services.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              No services yet. Create one to publish to the Service Catalog.
            </p>
          )}
        </div>
      </div>

      {/* Components */}
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
          {components.map((child) => (
            <ComponentRow
              key={child.id}
              node={child}
              basePath={currentPath}
            />
          ))}
          {components.length === 0 && (
            <p className="text-sm text-gray-400 italic px-3 py-4">
              No components yet.
            </p>
          )}
        </div>
      </div>

      {/* Add component input */}
      <div className="mt-4">
        <AddComponentInput />
      </div>

      {/* Other sections (Work Orders, etc.) */}
      {otherChildren.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              More
            </h2>
          </div>
          <div className="space-y-2">
            {otherChildren.map((child) => (
              <Link
                key={child.id}
                to={currentPath + "/" + child.id}
                className="group flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
                    {child.label}
                  </h3>
                  {child.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {child.description}
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-blue-400"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
