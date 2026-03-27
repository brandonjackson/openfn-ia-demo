import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  path: string;
}

export default function Breadcrumbs({
  ancestors,
  current,
}: {
  ancestors: Crumb[];
  current: string;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500">
      <Link to="/" className="hover:text-gray-900 flex items-center gap-1">
        <Home size={14} />
      </Link>
      {ancestors.map((a) => (
        <span key={a.path} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          <Link to={a.path} className="hover:text-gray-900">
            {a.label}
          </Link>
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium">{current}</span>
      </span>
    </nav>
  );
}
