import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { IANode } from "../ia-tree";

function NavItem({
  node,
  path,
  depth = 0,
}: {
  node: IANode;
  path: string;
  depth?: number;
}) {
  const location = useLocation();
  const fullPath = path + "/" + node.id;
  const isActive = location.pathname === fullPath;
  const isAncestor = location.pathname.startsWith(fullPath + "/");
  const hasChildren = node.children && node.children.length > 0;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isAncestor || isActive) {
      setExpanded(true);
    }
  }, [isAncestor, isActive]);

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 -ml-1 hover:bg-gray-200 rounded flex-shrink-0"
          >
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}
        <Link to={fullPath} className="flex-1 truncate">
          {node.label}
        </Link>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <NavItem
              key={child.id}
              node={child}
              path={fullPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ tree }: { tree: IANode[] }) {
  return (
    <aside className="w-72 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          OpenFN IA
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">
          Information Architecture
        </p>
      </div>
      <nav className="p-2">
        {tree.map((node) => (
          <NavItem key={node.id} node={node} path="" />
        ))}
      </nav>
    </aside>
  );
}
