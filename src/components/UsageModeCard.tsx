import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Badge from "./Badge";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Small badge beside the title, e.g. "Preview". */
  badge?: string;
  /** Extra content under the description, e.g. a code sample or endpoint. */
  children?: ReactNode;
}

/**
 * One way to use a published service, e.g. "Call it from a workflow" or
 * "Give it to an agent as an MCP tool".
 */
export default function UsageModeCard({ icon: Icon, title, description, badge, children }: Props) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
          <Icon size={16} className="text-blue-500" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {badge && <Badge label={badge} tone="blue" />}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children && <div className="mt-4 flex-1">{children}</div>}
    </div>
  );
}
