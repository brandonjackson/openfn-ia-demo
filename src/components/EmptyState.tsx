import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Optional call to action, usually a Button. */
  action?: ReactNode;
}

/**
 * Dashed placeholder shown when a list or section has nothing in it yet.
 */
export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      {Icon && <Icon size={24} className="mx-auto text-gray-300 mb-2" />}
      <p className="text-sm text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
