import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Badge from "../primitives/Badge";
import Card from "../primitives/Card";
import IconTile from "../primitives/IconTile";

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
    <Card padding="sm" className="flex flex-col">
      <div className="flex items-start gap-3">
        <IconTile icon={Icon} size="sm" tone="indigo" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {badge && <Badge label={badge} tone="indigo" />}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children && <div className="mt-4 flex-1">{children}</div>}
    </Card>
  );
}
