import { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  Search,
  Globe,
  ChevronRight,
  KeyRound,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { adaptors, type Adaptor } from "../mock-data/adaptors";

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
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400 text-sm">
            No systems match "{query}"
          </div>
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
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                      <Globe
                        size={16}
                        className="text-gray-400 group-hover:text-blue-500"
                      />
                    </div>
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
  const [apiToken, setApiToken] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [environment, setEnvironment] = useState<"production" | "staging">(
    "production"
  );
  const [sharing, setSharing] = useState<"org" | "private">("org");
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
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
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
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Globe size={18} className="text-blue-600" />
        </div>
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

        {/* Credentials */}
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="flex items-center gap-1.5 px-1 text-sm font-medium text-gray-700">
            <KeyRound size={14} className="text-gray-400" />
            Credentials
          </legend>

          <div className="space-y-4 mt-2">
            {/* API Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Token
              </label>
              <input
                type="text"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your API token"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your secret"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="environment"
                    value="production"
                    checked={environment === "production"}
                    onChange={() => setEnvironment("production")}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Production</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="environment"
                    value="staging"
                    checked={environment === "staging"}
                    onChange={() => setEnvironment("staging")}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Staging</span>
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Sharing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sharing
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSharing("org")}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 transition-colors ${
                sharing === "org"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  sharing === "org" ? "text-blue-700" : "text-gray-700"
                }`}
              >
                Org-wide
              </span>
              <span
                className={`text-xs ${
                  sharing === "org" ? "text-blue-500" : "text-gray-400"
                }`}
              >
                Shared across the organization
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSharing("private")}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 transition-colors ${
                sharing === "private"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  sharing === "private" ? "text-blue-700" : "text-gray-700"
                }`}
              >
                Private
              </span>
              <span
                className={`text-xs ${
                  sharing === "private" ? "text-blue-500" : "text-gray-400"
                }`}
              >
                Only visible to you
              </span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Add Connected System
          </button>
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
