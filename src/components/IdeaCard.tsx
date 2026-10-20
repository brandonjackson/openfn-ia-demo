import { Lightbulb } from "lucide-react";
import type { BuildIdea } from "../page-data";
import Badge from "./Badge";

interface Props {
  idea: BuildIdea;
  /** Called with the idea when it's picked, e.g. to fill the build prompt. */
  onSelect?: (idea: BuildIdea) => void;
}

/** A starter idea for a new service, showing which systems it connects. */
export default function IdeaCard({ idea, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(idea)}
      className="group flex h-full w-full flex-col rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-2">
        <Lightbulb size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{idea.title}</h3>
      </div>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gray-500">{idea.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {idea.systems.map((s) => (
          <Badge key={s} label={s} />
        ))}
      </div>
    </button>
  );
}
