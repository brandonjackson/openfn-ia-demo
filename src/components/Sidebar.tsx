import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  User,
  Building2,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { IANode } from "../ia-tree";
import { mainNavTree, projectsTree } from "../ia-tree";

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
  const hasChildren = node.children && node.children.length > 0 && node.id !== "connected-systems";
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

function ProjectNavItem({ node }: { node: IANode }) {
  const location = useLocation();
  const fullPath = "/projects/" + node.id;
  const isActive =
    location.pathname === fullPath ||
    location.pathname.startsWith(fullPath + "/");

  return (
    <Link
      to={fullPath}
      className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {node.label}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-72 border-r border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">Of</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">OpenFn</span>
        </Link>
      </div>

      {/* Dividing line is the border-b above */}

      {/* Main nav items */}
      <nav className="p-2 flex-1 overflow-y-auto">
        {mainNavTree.map((node) => (
          <NavItem key={node.id} node={node} path="" />
        ))}

        {/* Projects section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Projects
            </span>
            <button className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          {projectsTree.map((project) => (
            <ProjectNavItem key={project.id} node={project} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-2">
        <Link
          to="/user-settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <User size={14} />
          <span>Jane Doe</span>
        </Link>
        <Link
          to="/org-settings"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Building2 size={14} />
          <span>Org Settings</span>
        </Link>
      </div>
    </aside>
  );
}
