import type { ReactNode } from "react";
import PropertyList from "../PropertyList";
import type { Property } from "../PropertyList";

interface Props {
  title: string;
  /** A small tag after the title, e.g. the component's type. */
  tag?: ReactNode;
  description?: string;
  properties: Property[];
  /** An action under the details, e.g. "Open in project". */
  action?: ReactNode;
}

/**
 * The right-hand column in code mode for files that aren't steps: a plan or
 * spec document, or a project component the workflow uses. Names the file,
 * says what it is, and lists its facts.
 */
export default function FileDetailsPanel({ title, tag, description, properties, action }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
        <span className="truncate text-sm font-semibold text-gray-900">{title}</span>
        {tag}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <PropertyList properties={properties} />
        {action}
      </div>
    </div>
  );
}
