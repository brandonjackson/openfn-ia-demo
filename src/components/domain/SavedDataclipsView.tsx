import { useRef, useState } from "react";
import { Database, Pencil, Play, Plus } from "lucide-react";
import type { Dataclip } from "../../model/workflow";
import { dataclipTypeLabels, type DataclipChanges } from "../../model/dataclips";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Card from "../primitives/Card";
import Code from "../primitives/Code";
import DataSnippet from "../primitives/DataSnippet";
import EmptyState from "../primitives/EmptyState";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import ScrollPane from "../primitives/ScrollPane";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The project's saved dataclips (named ones), newest first. */
  dataclips: Dataclip[];
  /** Runs the workflow with one as its input. Left out where nothing can be run. */
  onRun?: (dataclip: Dataclip) => void;
  /** Changes one's title and description; resolves once saved, or rejects with why not. Left out where you can't. */
  onSave?: (id: string, changes: DataclipChanges) => Promise<void>;
  /** Opens the form for a new one. Left out where you can't. */
  onCreate?: () => void;
}

/**
 * A project's saved dataclips: inputs kept under a name to run the workflow
 * with again, whether written by hand, named from a run, or brought into a
 * sandbox when it was made. Each says what it's for and shows its data, with
 * Run as its main action; its title and description can be edited in place.
 * Shown in the workflow editor's code view, from the explorer's Workflow group.
 */
export default function SavedDataclipsView({ dataclips, onRun, onSave, onCreate }: Props) {
  return (
    <ScrollPane>
      <Stack gap="lg">
        <SectionHeading
          title="Saved dataclips"
          description="Inputs kept in the project to run this workflow with. Inputs you bring into a sandbox land here."
          action={
            onCreate && (
              <Button size="sm" variant="secondary" icon={Plus} onClick={onCreate}>
                New dataclip
              </Button>
            )
          }
        />
        {dataclips.length === 0 ? (
          <Card>
            <EmptyState
              icon={Database}
              title="No saved dataclips yet"
              description="Name an input when you run with custom input, or bring one across when you edit in a sandbox, and it's kept here to run with again."
            />
          </Card>
        ) : (
          <Stack gap="md">
            {dataclips.map((d) => (
              <SavedDataclipCard key={d.id} dataclip={d} onRun={onRun} onSave={onSave} />
            ))}
          </Stack>
        )}
      </Stack>
    </ScrollPane>
  );
}

function SavedDataclipCard({
  dataclip,
  onRun,
  onSave,
}: {
  dataclip: Dataclip;
  onRun?: (dataclip: Dataclip) => void;
  onSave?: (id: string, changes: DataclipChanges) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = dataclip.body.split("\n");

  return (
    <Card
      title={editing ? undefined : dataclip.name}
      description={editing ? undefined : (dataclip.description || "No description yet.")}
      actions={
        !editing && (
          <Inline gap="xs">
            {onSave && <IconButton icon={Pencil} label={`Edit ${dataclip.name}`} onClick={() => setEditing(true)} />}
            {onRun && (
              <Button size="sm" icon={Play} onClick={() => onRun(dataclip)}>
                Run
              </Button>
            )}
          </Inline>
        )
      }
    >
      <Stack gap="md">
        {editing && onSave && (
          <DataclipDetailsForm dataclip={dataclip} onSave={(changes) => onSave(dataclip.id, changes)} onDone={() => setEditing(false)} />
        )}
        <Inline gap="sm" wrap>
          <Badge label={dataclipTypeLabels[dataclip.type]} shape="tag" />
          <Code>{dataclip.id}</Code>
          <Text tone="muted" size="xs">
            {dataclip.created}
          </Text>
        </Inline>
        <DataSnippet
          title="Data"
          lines={lines}
          meta={`${lines.length} ${lines.length === 1 ? "line" : "lines"}`}
          previewLines={5}
          expanded={expanded}
          onExpand={() => setExpanded(true)}
          onCollapse={() => setExpanded(false)}
          expandLabel="Show all of it"
        />
      </Stack>
    </Card>
  );
}

/** A saved dataclip's title and description, edited in place. */
function DataclipDetailsForm({
  dataclip,
  onSave,
  onDone,
}: {
  dataclip: Dataclip;
  onSave: (changes: DataclipChanges) => Promise<void>;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<DataclipChanges>({ name: dataclip.name ?? "", description: dataclip.description ?? "" });
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<unknown>();
  const nameInput = useRef<HTMLInputElement>(null);
  const id = `dataclip-${dataclip.id}`;

  async function save() {
    if (saving) return;
    if (!draft.name.trim()) {
      setMissing(true);
      nameInput.current?.focus();
      return;
    }
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSave({ name: draft.name.trim(), description: draft.description.trim() });
      onDone();
    } catch (error) {
      setRefusal(error);
      setSaving(false);
    }
  }

  const nameError = (missing && !draft.name.trim() ? "Enter a title" : undefined) ?? fieldErrorOf(refusal, "name");
  const descriptionError = fieldErrorOf(refusal, "description");
  return (
    <form
      aria-label={`Edit ${dataclip.name}`}
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <Stack gap="md">
        {refusal !== undefined && !nameError && !descriptionError && <Callout variant="danger" title={errorMessageOf(refusal)} />}
        <FormField label="Title" htmlFor={`${id}-name`} error={nameError} required>
          <TextInput
            id={`${id}-name`}
            ref={nameInput}
            autoFocus
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Description" htmlFor={`${id}-description`} error={descriptionError} hint="What it's for, e.g. which case it tries.">
          <TextArea
            id={`${id}-description`}
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
        </FormField>
        <Inline gap="sm" justify="end">
          <Button type="button" variant="secondary" size="sm" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="sm" aria-disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}
