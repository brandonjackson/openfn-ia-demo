import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface Props {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}

/**
 * The white card that holds each settings section in Lightning's
 * settings.html.heex (`bg-white p-4 rounded-md space-y-4`), with its
 * `h6` title and small gray description.
 */
export default function SettingsCard({ title, description, children, className, id }: Props) {
  return (
    <div id={id} className={cn("bg-white p-4 rounded-md space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && <h6 className="font-medium text-black">{title}</h6>}
          {description && <small className="block my-1 text-xs text-gray-600">{description}</small>}
        </div>
      )}
      {children}
    </div>
  );
}
