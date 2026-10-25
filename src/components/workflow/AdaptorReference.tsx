import { useState } from "react";
import { Check, Copy, CornerDownLeft, ExternalLink, Search } from "lucide-react";
import type { AdaptorKind } from "../../mock-data/workflow";
import { adaptorNames, adaptorVersions } from "../../mock-data/workflow";
import { adaptorDocs } from "../../mock-data/adaptor-docs";
import AdaptorLogo from "../AdaptorLogo";
import CodeBlock from "../CodeBlock";
import Button from "../Button";
import EmptyState from "../EmptyState";
import { TextInput } from "../FormControls";
import TextLink from "../TextLink";

/**
 * The Adaptor docs tray: the open step's adaptor and its most-used functions,
 * each with a snippet to start from. Where a step can be edited, "Insert"
 * adds the snippet to the end of its code; otherwise "Copy" copies it.
 *
 * This answers "where do adaptor snippets live?": next to the code, in a
 * tray you can keep open while you write, and reachable from the adaptor
 * chip in the step bar.
 */
export default function AdaptorReference({
  adaptor,
  onInsert,
}: {
  /** The open step's adaptor; undefined when no step is open. */
  adaptor?: AdaptorKind;
  /** Adds a snippet to the open step; omit when it can't be edited. */
  onInsert?: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string>();

  if (!adaptor) {
    return (
      <div className="p-4">
        <EmptyState title="No step open" description="Open a step to see its adaptor's functions and snippets." />
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const functions = adaptorDocs[adaptor].filter(
    (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
  );

  const copy = (name: string, code: string) => {
    void navigator.clipboard?.writeText(code);
    setCopied(name);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <AdaptorLogo adaptor={adaptor} name={adaptorNames[adaptor]} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{adaptorNames[adaptor]}</p>
          <p className="font-mono text-[11px] text-gray-500">
            @openfn/language-{adaptor}@{adaptorVersions[adaptor]}
          </p>
        </div>
        <TextLink variant="action" href={`https://docs.openfn.org/adaptors/packages/${adaptor}-docs`}>
          <span className="inline-flex items-center gap-1 text-xs">
            Full docs <ExternalLink size={11} />
          </span>
        </TextLink>
      </div>

      <label className="relative block">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search functions"
          aria-label="Search functions"
          className="pl-8"
        />
      </label>

      {functions.length === 0 && <p className="text-sm text-gray-500">No functions match.</p>}

      <ul className="space-y-5">
        {functions.map((f) => (
          <li key={f.name} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[13px] text-gray-900">{f.signature}</p>
                <p className="mt-0.5 text-xs text-gray-500">{f.description}</p>
              </div>
              {onInsert ? (
                <Button
                  variant="secondary"
                  size="xs"
                  icon={CornerDownLeft}
                  onClick={() => onInsert(f.example)}
                  title="Add this snippet to the end of the step's code"
                >
                  Insert
                </Button>
              ) : (
                <Button variant="secondary" size="xs" icon={copied === f.name ? Check : Copy} onClick={() => copy(f.name, f.example)}>
                  {copied === f.name ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            <CodeBlock code={f.example} />
          </li>
        ))}
      </ul>
    </div>
  );
}
