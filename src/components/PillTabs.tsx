import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

export interface PillTab {
  id: string;
  label: string;
  to: string;
}

/** Pill-style tab bar (Lightning's TabBar.pill_tabs), e.g. History's Work Orders / Channel Logs. */
export default function PillTabs({ tabs, active, id }: { tabs: PillTab[]; active: string; id?: string }) {
  return (
    <div id={id} className="bg-slate-100 p-1 rounded-lg">
      <nav className="flex gap-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.to}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              tab.id === active ? "bg-white text-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
