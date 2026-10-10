import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  /** Optional action (usually a Button) aligned to the right. */
  action?: ReactNode;
}

/**
 * Heading at the top of a settings section or content panel.
 */
export default function SectionHeading({ title, description, action }: Props) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
