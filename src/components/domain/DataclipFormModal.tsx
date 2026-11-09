import { useRef, useState } from "react";
import type { DataclipDraft } from "../../model/dataclips";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import { describeJsonProblem } from "./json-input";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Stack from "../primitives/Stack";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Saves it; resolves once saved (the modal closes itself), or rejects with why not. */
  onSubmit: (draft: DataclipDraft) => Promise<void>;
  /** The title it starts with, e.g. one no other saved dataclip has. */
  defaultName?: string;
}

/**
 * Saving a new dataclip in the project: a title, what it's for, and the
 * JSON to run the workflow with. It then shows in Saved dataclips.
 */
export default function DataclipFormModal({ open, ...rest }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <DataclipForm {...rest} />;
}

function DataclipForm({ onClose, onSubmit, defaultName = "" }: Omit<Props, "open">) {
  const [draft, setDraft] = useState<DataclipDraft>({ name: defaultName, description: "", body: "{\n  \n}" });
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<unknown>();
  const nameInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLTextAreaElement>(null);

  const nameProblem = draft.name.trim() ? undefined : "Enter a title";
  const bodyProblem = describeJsonProblem(draft.body) ?? undefined;

  async function submit() {
    if (saving) return;
    setChecked(true);
    if (nameProblem) return nameInput.current?.focus();
    if (bodyProblem) return bodyInput.current?.focus();
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSubmit({ name: draft.name.trim(), description: draft.description.trim(), body: draft.body });
      onClose();
    } catch (error) {
      setRefusal(error);
      setSaving(false);
    }
  }

  const nameError = (checked ? nameProblem : undefined) ?? fieldErrorOf(refusal, "name");
  const bodyError = (checked ? bodyProblem : undefined) ?? fieldErrorOf(refusal, "body");
  return (
    <Modal
      open
      title="New saved dataclip"
      onClose={onClose}
      widthClass="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} aria-disabled={saving}>
            {saving ? "Saving…" : "Save dataclip"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {refusal !== undefined && !nameError && !bodyError && <Callout variant="danger" role="alert" title={errorMessageOf(refusal)} />}
        <FormField label="Title" htmlFor="dataclip-name" error={nameError} required>
          <TextInput
            id="dataclip-name"
            ref={nameInput}
            autoFocus
            value={draft.name}
            placeholder="Sample application: new citizen"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Description" htmlFor="dataclip-description" hint="What it's for, e.g. which case it tries.">
          <TextArea
            id="dataclip-description"
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
        </FormField>
        <FormField label="Data" htmlFor="dataclip-body" error={bodyError} hint="A JSON object: what the workflow's first step receives." required>
          <TextArea
            id="dataclip-body"
            ref={bodyInput}
            rows={8}
            mono
            spellCheck={false}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
        </FormField>
      </Stack>
    </Modal>
  );
}
