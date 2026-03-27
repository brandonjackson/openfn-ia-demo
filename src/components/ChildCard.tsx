import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { IANode } from "../ia-tree";
import Badge from "./Badge";

export default function ChildCard({
  node,
  basePath,
}: {
  node: IANode;
  basePath: string;
}) {
  const to = basePath + "/" + node.id;
  return (
    <Link
      to={to}
      className="group block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
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
        <p className="mt-1 text-sm text-gray-500">{node.description}</p>
      )}
      {node.children && (
        <p className="mt-2 text-xs text-gray-400">
          {node.children.length} sub-page{node.children.length !== 1 ? "s" : ""}
        </p>
      )}
    </Link>
  );
}
