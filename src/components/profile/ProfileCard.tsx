import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * The white rounded card every /profile section sits in
 * (`bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 mb-4`).
 * By default it adds Lightning's `px-4 py-6 sm:p-8` body padding.
 */
export default function ProfileCard({
  children,
  padded = true,
  className,
  id,
  annotation,
}: {
  children: ReactNode;
  padded?: boolean;
  className?: string;
  id?: string;
  /** INVENTORY.md id shown by the annotations panel on hover. */
  annotation?: string;
}) {
  return (
    <div
      id={id}
      data-annotation={annotation}
      className={cn("bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 mb-4", className)}
    >
      {padded ? <div className="px-4 py-6 sm:p-8">{children}</div> : children}
    </div>
  );
}

/** Title + description pair used on the toggle cards (MFA, GitHub, experimental features). */
export function ProfileCardHeading({ id, title, description }: { id?: string; title: ReactNode; description: ReactNode }) {
  return (
    <span className="flex flex-grow flex-col">
      <span className="text-xl font-medium leading-6 text-gray-900" id={id && `${id}-label`}>
        {title}
      </span>
      <span className="text-sm text-gray-500" id={id && `${id}-description`}>
        {description}
      </span>
    </span>
  );
}
