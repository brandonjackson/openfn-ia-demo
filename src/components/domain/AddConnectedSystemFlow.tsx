import { firstProblemOf } from "../../model/form-error";
import Text from "../primitives/Text";
import { useState, useMemo, useRef, useEffect } from "react";
import { X, ChevronRight, Check } from "lucide-react";
import { type Adaptor } from "../../model/adaptors";
import AdaptorLogo from "./AdaptorLogo";
import Button from "../primitives/Button";
import EmptyState from "../primitives/EmptyState";
import SearchInput from "../primitives/SearchInput";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Every adaptor a system can be connected with, to search and pick from. */
  adaptors: Adaptor[];
  /** Pre-select a system by name (e.g. from "Suggested to add") */
  preselectedSystem?: string;
  /**
   * Adds the system. The form waits for it, and shows why if it's refused.
   * Left out, adding just shows the success state (for stories).
   */
  onAdd?: (system: NewSystemInput) => Promise<void>;
}

/** What the form asks for when adding a system. */
export interface NewSystemInput {
  name: string;
  description: string;
  /** The adaptor it's connected with, by id. */
  adaptor: string;
  endpointUrl: string;
  docsUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Adaptor search list                                                */
/* ------------------------------------------------------------------ */

function AdaptorSearchList({
  adaptors,
  onSelect,
}: {
  adaptors: Adaptor[];
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
  }, [query, adaptors]);

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
      <div className="px-5 pt-1 pb-3">
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search systems (e.g. DHIS2, Salesforce, PostgreSQL...)"
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
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-indigo-50 transition-colors group"
                  >
                    <AdaptorLogo adaptor={adaptor.id} name={adaptor.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">
                        {adaptor.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {adaptor.description}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-indigo-400 flex-shrink-0"
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
  onAdd,
}: {
  adaptor: Adaptor;
  onBack: () => void;
  onClose: () => void;
  onAdd?: Props["onAdd"];
}) {
  const [name, setName] = useState(adaptor.name);
  const [description, setDescription] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const add = async () => {
    setSaving(true);
    setError(null);
    try {
      await onAdd?.({ name: name.trim(), description: description.trim(), adaptor: adaptor.id, endpointUrl: endpointUrl.trim(), docsUrl: docsUrl.trim() });
      setSubmitted(true);
    } catch (refused) {
      setError(refused);
    } finally {
      setSaving(false);
    }
  };

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
        className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
      >
        <ChevronRight size={12} className="rotate-180" />
        Change system type
      </button>

      <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 mb-6">
        <AdaptorLogo adaptor={adaptor.id} name={adaptor.name} />
        <div>
          <p className="text-sm font-semibold text-indigo-900">{adaptor.name}</p>
          <p className="text-xs text-indigo-600">{adaptor.description}</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        {/* Name */}
        <FormField label="Name" hint="A display name for this connected system.">
          <TextInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description" hint={`${description.length}/240 characters`}>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this system is used for..."
            rows={3}
            maxLength={240}
          />
        </FormField>

        {/* Endpoint URL */}
        <FormField label="Endpoint URL" hint="The base URL of the system's API." optional>
          <TextInput
            type="url"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            placeholder="https://"
          />
        </FormField>

        {/* Docs URL */}
        <FormField label="Docs URL" hint="Where to find the system's API documentation." optional>
          <TextInput
            type="url"
            value={docsUrl}
            onChange={(e) => setDocsUrl(e.target.value)}
            placeholder="https://"
          />
        </FormField>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {error !== null && <Text tone="danger">{firstProblemOf(error)}</Text>}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void add()} disabled={saving || !name.trim()}>
            {saving ? "Adding…" : "Add connected system"}
          </Button>
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
  adaptors,
  preselectedSystem,
  onAdd,
}: Props) {
  const findPreselected = () =>
    preselectedSystem
      ? adaptors.find(
          (a) => a.name.toLowerCase() === preselectedSystem.toLowerCase()
        ) ?? null
      : null;
  const [selectedAdaptor, setSelectedAdaptor] = useState<Adaptor | null>(findPreselected);

  // Re-sync when the modal opens or preselectedSystem changes while open
  const [synced, setSynced] = useState({ open, preselectedSystem });
  if (synced.open !== open || synced.preselectedSystem !== preselectedSystem) {
    setSynced({ open, preselectedSystem });
    if (open) {
      const match = findPreselected();
      if (match || !preselectedSystem) setSelectedAdaptor(match);
    }
  }

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
            onAdd={onAdd}
          />
        ) : (
          <AdaptorSearchList adaptors={adaptors} onSelect={setSelectedAdaptor} />
        )}
      </div>
    </div>
  );
}
