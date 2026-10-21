import { useState } from "react";
import { Play } from "lucide-react";
import type { Dataclip } from "../mock-data/workflow";
import { describeJsonProblem } from "../json-input";
import Modal from "./Modal";
import Button from "./Button";
import FormField from "./FormField";
import { TextArea, TextInput } from "./FormControls";
import SegmentedControl from "./SegmentedControl";
import CodeBlock from "./CodeBlock";
import DataclipList from "./workflow/DataclipList";

/** The input a manual run starts from. */
export type RunInput =
  | { kind: "empty" }
  | { kind: "new"; body: string; /** Saves it under this name for reuse. */ name?: string }
  | { kind: "existing"; dataclip: Dataclip };

type Tab = "Empty" | "New" | "Existing";

const EXAMPLE = `{
  "given_name": "",
  "family_name": "",
  "date_of_birth": ""
}`;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Dataclips in the project to pick an existing input from. */
  dataclips: Dataclip[];
  onRun: (input: RunInput) => void;
  /** Tab to open on (useful for stories). */
  defaultTab?: Tab;
}

/**
 * "Run with custom input": choose what the run starts from. Empty starts from
 * `{}`; New lets you write JSON, and name it to use again later; Existing
 * picks a dataclip already in the project, such as a past request or a saved
 * input, and previews it.
 */
export default function RunInputModal({ open, ...rest }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <RunInputForm {...rest} />;
}

function RunInputForm({ onClose, dataclips, onRun, defaultTab = "Existing" }: Omit<Props, "open">) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [body, setBody] = useState(EXAMPLE);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Dataclip | undefined>();

  const bodyProblem = tab === "New" ? describeJsonProblem(body) : null;

  // Named inputs first, then the rest; search matches a name or an id.
  const q = query.trim().toLowerCase();
  const matches = dataclips
    .filter((d) => !q || d.name?.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
    .sort((a, b) => Number(Boolean(b.name)) - Number(Boolean(a.name)));

  const canRun = tab === "Empty" || (tab === "New" && !bodyProblem) || (tab === "Existing" && selected);

  const run = () => {
    if (tab === "Empty") onRun({ kind: "empty" });
    else if (tab === "New") onRun({ kind: "new", body, name: name.trim() || undefined });
    else if (selected) onRun({ kind: "existing", dataclip: selected });
  };

  return (
    <Modal
      open
      title="Run with custom input"
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Play} disabled={!canRun} onClick={run}>
            Run
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SegmentedControl
          label="Start with"
          options={["Empty", "New", "Existing"]}
          value={tab}
          onChange={(value) => setTab(value as Tab)}
        />

        {tab === "Empty" && (
          <p className="text-sm text-gray-600">
            The run starts with an empty input, <code className="font-mono text-gray-900">{"{}"}</code>. Useful when
            the first step fetches its own data.
          </p>
        )}

        {tab === "New" && (
          <>
            <FormField
              label="Input"
              htmlFor="run-input-body"
              hint={bodyProblem ? <span className="text-red-600">{bodyProblem}</span> : "A JSON object."}
            >
              <TextArea
                id="run-input-body"
                rows={9}
                spellCheck={false}
                className="font-mono text-xs"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </FormField>
            <FormField
              label="Name (optional)"
              htmlFor="run-input-name"
              hint="Named inputs can be picked again later, and brought into a sandbox."
            >
              <TextInput
                id="run-input-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Application with a missing date of birth"
              />
            </FormField>
          </>
        )}

        {tab === "Existing" && (
          <>
            <TextInput
              aria-label="Search inputs"
              placeholder="Search by name or id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <DataclipList
              dataclips={matches}
              selectedId={selected?.id}
              onSelect={setSelected}
              groupName="run-input"
              emptyMessage="No inputs match your search."
            />
            {selected && <CodeBlock label={selected.name ?? selected.id} code={selected.body} />}
          </>
        )}
      </div>
    </Modal>
  );
}
