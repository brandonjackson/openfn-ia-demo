import { useState, useMemo, useRef, useEffect } from "react";
import { X, Search, ChevronRight, Check } from "lucide-react";
import { adaptors, type Adaptor } from "../mock-data/adaptors";
import AdaptorLogo from "./AdaptorLogo";
import Button from "./Button";
import EmptyState from "./EmptyState";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-select a system by name (e.g. from "Suggested to add") */
  preselectedSystem?: string;
}

/* ------------------------------------------------------------------ */
/*  Adaptor search list                                                */
/* ------------------------------------------------------------------ */

function AdaptorSearchList({
  onSelect,
}: {
  onSelect: (adaptor: Adaptor) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus search on mount
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return adaptors;
    const q = query.toLowerCase();
    return adaptors.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Adaptor[]>();
    for (const a of filtered) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="relative px-5 pt-1 pb-3">
        <Search
          size={16}
          className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search systems (e.g. DHIS2, Salesforce, PostgreSQL...)"
          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {grouped.length === 0 && (
          <EmptyState title={`No systems match "${query}"`} />
        )}

        {grouped.map(([category, items]) => (
          <div key={category} className="mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              {category}
            </p>
            <ul className="space-y-1">
              {items.map((adaptor) => (
                <li key={adaptor.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(adaptor)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-blue-50 transition-colors group"
                  >
                    <AdaptorLogo adaptor={adaptor.id} name={adaptor.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                        {adaptor.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {adaptor.description}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-blue-400 flex-shrink-0"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Configuration form (shown after selecting a system type)           */
/* ------------------------------------------------------------------ */

function ConfigForm({
  adaptor,
  onBack,
  onClose,
}: {
  adaptor: Adaptor;
  onBack: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(adaptor.name);
  const [description, setDescription] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check size={24} className="text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {name} connected!
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Your new connected system has been added successfully.
        </p>
        <Button onClick={onClose}>Done</Button>
      </div>
    );
  }

  return (
    <div className="px-5 pb-5 overflow-y-auto flex-1">
      {/* Selected system header */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
      >
        <ChevronRight size={12} className="rotate-180" />
        Change system type
      </button>

      <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mb-6">
        <AdaptorLogo adaptor={adaptor.id} name={adaptor.name} />
        <div>
          <p className="text-sm font-semibold text-blue-900">{adaptor.name}</p>
          <p className="text-xs text-blue-600">{adaptor.description}</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            A display name for this connected system.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this system is used for..."
            rows={3}
            maxLength={240}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            {description.length}/240 characters
          </p>
        </div>

        {/* Endpoint URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint URL <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            placeholder="https://"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            The base URL of the system's API.
          </p>
        </div>

        {/* Docs URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Docs URL <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={docsUrl}
            onChange={(e) => setDocsUrl(e.target.value)}
            placeholder="https://"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Where to find the system's API documentation.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setSubmitted(true)}>Add connected system</Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main modal                                                         */
/* ------------------------------------------------------------------ */

export default function AddConnectedSystemFlow({
  open,
  onClose,
  preselectedSystem,
}: Props) {
  const [selectedAdaptor, setSelectedAdaptor] = useState<Adaptor | null>(() => {
    if (preselectedSystem) {
      return (
        adaptors.find(
          (a) => a.name.toLowerCase() === preselectedSystem.toLowerCase()
        ) ?? null
      );
    }
    return null;
  });

  // Re-sync when preselectedSystem changes while modal opens
  useEffect(() => {
    if (open && preselectedSystem) {
      const match = adaptors.find(
        (a) => a.name.toLowerCase() === preselectedSystem.toLowerCase()
      );
      if (match) setSelectedAdaptor(match);
    }
    if (open && !preselectedSystem) {
      setSelectedAdaptor(null);
    }
  }, [open, preselectedSystem]);

  if (!open) return null;

  const handleClose = () => {
    setSelectedAdaptor(null);
    onClose();
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {selectedAdaptor ? "Configure System" : "Add Connected System"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {selectedAdaptor ? (
          <ConfigForm
            adaptor={selectedAdaptor}
            onBack={() => setSelectedAdaptor(null)}
            onClose={handleClose}
          />
        ) : (
          <AdaptorSearchList onSelect={setSelectedAdaptor} />
        )}
      </div>
    </div>
  );
}
