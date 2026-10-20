import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  /** Optional action (usually a Button) aligned to the right. */
  action?: ReactNode;
  /**
   * `default` heads a settings section; `label` is the small uppercase
   * heading that groups rows on a list page.
   */
  variant?: "default" | "label";
}

/**
 * Heading at the top of a settings section or content panel.
 */
export default function SectionHeading({ title, description, action, variant = "default" }: Props) {
  const isLabel = variant === "label";
  return (
    <div className={`flex items-start justify-between gap-4 ${isLabel ? "mb-3" : "mb-6"}`}>
      <div>
        <h2
          className={
            isLabel
              ? "text-sm font-semibold text-gray-500 uppercase tracking-wider"
              : "text-lg font-semibold text-gray-900"
          }
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
