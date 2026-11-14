import { useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import Button from "./Button";
import Callout from "./Callout";
import CodeEditor from "./CodeEditor";
import Inline from "./Inline";
import Markdown from "./Markdown";
import Stack from "./Stack";
import Text from "./Text";

/** The editor's pieces, for whoever frames it: its buttons, and the text or the editor. */
export interface MarkdownEditorSlots {
  /** Edit, or Cancel and Save while editing; nothing when it can't be changed. */
  actions?: ReactNode;
  /** The Markdown drawn, or the code editor while editing. */
  body: ReactNode;
  /** Whether it's being edited. */
  editing: boolean;
}

interface Props {
  /** The Markdown as saved. */
  source: string;
  /**
   * Saves the edited Markdown; resolves once it's saved, or rejects with an
   * `Error` whose message says why not, shown over the editor. Left out
   * where it can't be changed: it's drawn with no Edit.
   */
  onSave?: (source: string) => Promise<void>;
  /** In place of Edit where it can't be changed here, e.g. a button to change it somewhere else. */
  readOnlyAction?: ReactNode;
  /** What a screen reader calls the editor, e.g. "spec.md". */
  label?: string;
  /** Shown in place of the text when there's none yet. */
  empty?: ReactNode;
  /** Show the Markdown's "Contents" box (see `Markdown`). */
  contents?: boolean;
  /** Frames the pieces; without it, the buttons sit in a row above the text. */
  children?: (slots: MarkdownEditorSlots) => ReactNode;
}

/**
 * A Markdown file, drawn as it reads, with an Edit button that turns it into
 * the code editor, and Cancel and Save to turn it back. Save says "Saving…"
 * while it's on its way (marked `aria-disabled`, so a second press is
 * ignored), and a refusal shows over the editor, which keeps what you wrote.
 * Pass `children` to put the buttons in a card's header or a page's actions.
 */
export default function MarkdownEditor({ source, onSave, readOnlyAction, label = "Markdown", empty, contents = false, children }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<string>();
  const editing = draft !== null;

  const save = async () => {
    if (draft === null || !onSave || saving) return;
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSave(draft);
      setDraft(null);
    } catch (e) {
      setRefusal(e instanceof Error ? e.message : "That didn't save.");
    } finally {
      setSaving(false);
    }
  };

  const actions = !onSave ? (
    readOnlyAction
  ) : editing ? (
    <Inline gap="sm">
      <Button variant="secondary" size="sm" onClick={() => setDraft(null)}>
        Cancel
      </Button>
      <Button size="sm" aria-disabled={saving || undefined} onClick={() => void save()}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </Inline>
  ) : (
    <Button
      variant="secondary"
      size="sm"
      icon={Pencil}
      onClick={() => {
        setRefusal(undefined);
        setDraft(source);
      }}
    >
      Edit
    </Button>
  );

  const body = editing ? (
    <Stack gap="sm">
      {refusal && (
        <Callout variant="danger" title="That didn't save">
          {refusal}
        </Callout>
      )}
      <CodeEditor code={draft} onChange={setDraft} frame="box" label={label} />
    </Stack>
  ) : source.trim() ? (
    <Markdown source={source} contents={contents} />
  ) : (
    (empty ?? <Text tone="muted">Nothing written yet.</Text>)
  );

  if (children) return children({ actions, body, editing });
  return (
    <Stack gap="md">
      {actions && <Inline justify="end">{actions}</Inline>}
      {body}
    </Stack>
  );
}
