import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { AdaptorInfo, Snippet } from "../../model/adaptor-reference";
import SnippetCard from "./SnippetCard";
import AdaptorLogo from "./AdaptorLogo";
import SearchInput from "../primitives/SearchInput";

interface Props {
  /** The open step's adaptor: its name, package, version, docs and what it's for. */
  adaptor: AdaptorInfo;
  /** The adaptor's snippets; they are always for the open step's adaptor. */
  snippets: Snippet[];
  /** Inserts a snippet at the cursor in the open step; unset when nothing editable is open. */
  onInsert?: (snippet: Snippet) => void;
  /** The step the snippets would go into, named in the hint. */
  stepLabel?: string;
}

/**
 * The Snippets view beside the code: what the open step's adaptor is for, a
 * link to its docs, and its operations as snippets you can search and insert
 * at the cursor. It always follows the step's adaptor; changing the adaptor
 * is the Config view's job.
 */
export default function AdaptorReferencePanel({ adaptor: info, snippets: allSnippets, onInsert, stepLabel }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const snippets = allSnippets.filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <AdaptorLogo adaptor={info.id} size="md" />
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
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Full docs <ExternalLink size={11} />
            </a>
          </div>
        </div>
        <SearchInput compact value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${info.name} operations`} />
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {onInsert && stepLabel && (
          <p className="text-xs text-gray-500">
            Click a snippet to insert it at the cursor in <span className="font-medium text-gray-700">{stepLabel}</span>.
          </p>
        )}
        {!onInsert && <p className="text-xs text-gray-500">Read-only. Edit in a sandbox to insert snippets.</p>}
        {snippets.map((s) => (
          <SnippetCard key={s.id} snippet={s} onInsert={onInsert} />
        ))}
        {snippets.length === 0 && <p className="text-sm text-gray-500">No operations match.</p>}
      </div>
    </div>
  );
}
