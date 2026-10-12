import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { BuildingBlock } from "../page-data";

interface Props {
  block: BuildingBlock;
  icon: LucideIcon;
}

/** A compact link to something available to build with: a system, channel or service. */
export default function BuildingBlockTile({ block, icon: Icon }: Props) {
  return (
    <Link
      to={block.to}
      className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-sm"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">{block.name}</span>
          {block.meta && <span className="truncate text-xs text-gray-400">{block.meta}</span>}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{block.description}</p>
      </div>
    </Link>
  );
}
