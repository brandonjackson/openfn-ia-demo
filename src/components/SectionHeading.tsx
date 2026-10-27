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
  /** A smaller `label`, for the sections of a narrow card such as the inspector. */
  compact?: boolean;
}

/**
 * Heading at the top of a settings section or content panel.
 */
export default function SectionHeading({ title, description, action, variant = "default", compact = false }: Props) {
  const isLabel = variant === "label";
  return (
    <div className={`flex justify-between gap-4 ${compact ? "items-baseline" : "items-start"} ${isLabel ? (compact ? "mb-2" : "mb-3") : "mb-6"}`}>
      <div className="min-w-0">
        <h2
          className={
            isLabel
              ? compact
                ? "text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-900"
                : "text-sm font-semibold text-gray-500 uppercase tracking-wider"
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
