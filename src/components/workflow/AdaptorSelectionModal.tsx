import { useMemo, useState } from "react";
import { adaptors, resolvedAdaptorVersion } from "../../mock-data/adaptors";
import AdaptorIcon from "./AdaptorIcon";
import EditorDialog from "./EditorDialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (adaptorPackage: string) => void;
  /** Short names of adaptors already used in the project, listed first. */
  adaptorsInUse?: string[];
}

function Row({ id, title, onClick, size }: { id: string; title: string; onClick: () => void; size: "sm" | "md" }) {
  const pkg = `@openfn/language-${id}`;
  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-label={`Select ${title} adaptor`}
      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 focus:outline-none flex items-center gap-3 transition-colors"
    >
      <div className="shrink-0">
        <AdaptorIcon name={pkg} size={size} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-normal text-gray-900">{title}</div>
        <div className="text-sm text-gray-500 line-clamp-2">Latest: {resolvedAdaptorVersion(pkg)}</div>
      </div>
    </button>
  );
}

/**
 * Searchable adaptor picker (AdaptorSelectionModal.tsx + SearchableList):
 * "Adaptors in this project" first, then all adaptors, with the HTTP hint
 * when nothing matches.
 */
export default function AdaptorSelectionModal({ isOpen, onClose, onSelect, adaptorsInUse = [] }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => adaptors.filter((a) => !q || a.name.toLowerCase().includes(q) || a.id.includes(q)),
    [q]
  );
  const inProject = matches.filter((a) => adaptorsInUse.includes(a.id));
  const rest = matches.filter((a) => !adaptorsInUse.includes(a.id));
  const fallback = matches.length === 0;
  const pick = (id: string) => {
    onSelect(`@openfn/language-${id}`);
    onClose();
  };

  return (
    <EditorDialog open={isOpen} onClose={onClose} className="px-4 pb-4 pt-5 sm:max-w-lg sm:p-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an adaptor to connect..."
            autoComplete="off"
            className="block w-full rounded-md border-secondary-300 pl-10 pr-10 shadow-xs sm:text-sm focus:border-primary-300 focus:ring focus:ring-primary-200/50"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="hero-magnifying-glass h-5 w-5 text-gray-400" />
          </div>
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="hero-x-mark h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div role="listbox" aria-label="Adaptor options" className="max-h-96 overflow-y-auto">
          {fallback && (
            <>
              <div className="mb-4 px-3 py-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">No adaptor found</span> for "{query}"
                </p>
                <p className="text-sm text-gray-600">Try the HTTP adaptor below to connect to any system with a REST API.</p>
              </div>
              <Row id="http" title="HTTP" size="sm" onClick={() => pick("http")} />
            </>
          )}
          {inProject.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h3 className="px-3 py-2 text-sm text-gray-400">Adaptors in this project</h3>
              <div className="space-y-1">
                {inProject.map((a) => (
                  <Row key={a.id} id={a.id} title={a.name} size="md" onClick={() => pick(a.id)} />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h3 className="px-3 py-2 text-sm text-gray-400">{inProject.length > 0 ? "All adaptors" : "Available adaptors"}</h3>
              <div className="space-y-1">
                {rest.map((a) => (
                  <Row key={a.id} id={a.id} title={a.name} size="sm" onClick={() => pick(a.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </EditorDialog>
  );
}
