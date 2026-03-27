import { useState } from "react";
import type { IANode } from "../ia-tree";
import Badge from "./Badge";
import ChildCard from "./ChildCard";
import Breadcrumbs from "./Breadcrumbs";
import { Link } from "react-router-dom";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
}

export default function PageShell({ node, ancestors, currentPath }: Props) {
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
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
          {node.badges?.map((b) => <Badge key={b} label={b} />)}
        </div>

        {node.actions && node.actions.length > 0 && (
          <div className="mt-3 flex gap-2">
            {node.actions.map((action) => (
              <button
                key={action}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {node.linkedFrom && (
          <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
            Also accessible from{" "}
            <Link to={node.linkedFrom} className="underline font-medium">
              {node.linkedFrom}
            </Link>
          </div>
        )}

        {node.filters && node.filters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {node.filters.map((filter) => (
              <FilterGroup
                key={filter.label}
                label={filter.label}
                options={filter.options}
              />
            ))}
          </div>
        )}

        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
          {node.description || `Content for "${node.label}" goes here.`}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Sub-pages
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {node.children.map((child) => (
                <ChildCard
                  key={child.id}
                  node={child}
                  basePath={currentPath}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  const [selected, setSelected] = useState(options[0]);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              selected === opt
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
