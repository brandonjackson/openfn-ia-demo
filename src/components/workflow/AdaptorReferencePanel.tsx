import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { AdaptorKind } from "../../mock-data/workflow";
import { adaptorChoices, adaptorInfo, adaptorSnippets } from "../../mock-data/adaptor-reference";
import type { Snippet } from "../../mock-data/adaptor-reference";
import { Select } from "../FormControls";
import SnippetRow from "./SnippetRow";
import { AdaptorIcon } from "./AdaptorIcon";

interface Props {
  adaptor: AdaptorKind;
  /** Lets the reader browse another adaptor's reference without switching the step. */
  onChangeAdaptor?: (adaptor: AdaptorKind) => void;
  /** Inserts a snippet into the open step; unset when nothing editable is open. */
  onInsert?: (snippet: Snippet) => void;
  /** The step the snippets would go into, named in the hint. */
  stepLabel?: string;
}

/**
 * The adaptor reference tray: what the adaptor is for, a link to its docs,
 * and its operations as snippets you can search, expand and insert into the
 * open step. It follows the open step's adaptor, but you can browse others.
 */
export default function AdaptorReferencePanel({ adaptor, onChangeAdaptor, onInsert, stepLabel }: Props) {
  const [query, setQuery] = useState("");
  const info = adaptorInfo[adaptor];
  const q = query.trim().toLowerCase();
  const snippets = adaptorSnippets[adaptor].filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <AdaptorIcon adaptor={adaptor} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{info.name}</span>
              <span className="font-mono text-xs text-gray-400">{info.package}@{info.version}</span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{info.description}</p>
            <a
              href={info.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Full docs <ExternalLink size={11} />
            </a>
          </div>
        </div>
        {onChangeAdaptor && (
          <label className="flex items-center gap-2 text-xs text-gray-500">
            Browse
            <Select
              options={adaptorChoices.map((a) => adaptorInfo[a].name)}
              value={info.name}
              onChange={(e) => onChangeAdaptor(adaptorChoices.find((a) => adaptorInfo[a].name === e.target.value) ?? adaptor)}
              className="w-auto py-1 text-xs"
            />
          </label>
        )}
        <label className="flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-400 focus-within:border-blue-300">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${info.name} operations`}
            className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {onInsert && stepLabel && (
          <p className="text-xs text-gray-500">
            Insert adds the snippet to the end of <span className="font-medium text-gray-700">{stepLabel}</span>.
          </p>
        )}
        {snippets.map((s) => (
          <SnippetRow key={s.id} snippet={s} onInsert={onInsert} variant="card" />
        ))}
        {snippets.length === 0 && <p className="text-sm text-gray-500">No operations match.</p>}
      </div>
    </div>
  );
}
