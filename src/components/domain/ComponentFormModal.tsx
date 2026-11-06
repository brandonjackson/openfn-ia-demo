import { useState } from "react";
import { Sparkles } from "lucide-react";
import { componentDraftErrors, type ComponentDraft, type ContentComponentType } from "../../model/project-components";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Stack from "../primitives/Stack";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";

interface Props {
  open: boolean;
  /** The kind being made or edited. */
  type: ContentComponentType;
  /** The component being edited; without it, a new one is being made. */
  initial?: ComponentDraft;
  /** Names used by the project's other components of this kind. */
  takenNames: string[];
  onClose: () => void;
  /** Saves it; resolves once saved (the modal closes itself), or rejects with why not. */
  onSubmit: (draft: ComponentDraft) => Promise<void>;
  /** Hands the kind to AI to draft from a description instead. Left out without Build with AI. */
  onDraftWithAI?: () => void;
}

const placeholders: Record<ContentComponentType, string> = {
  Form: "household-registration",
  Artifact: "field-mapping.json",
  "AI Skill": "summarise-referrals",
  Document: "onboarding-guide",
  "Static Website": "service-status-page",
};

/**
 * Making a form, artifact, AI skill, document or static website, or editing
 * its name and description. A new one starts from a blank file of its kind,
 * which its page then edits.
 */
export default function ComponentFormModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <ComponentForm {...rest} />;
}

function ComponentForm({ type, initial, takenNames, onClose, onSubmit, onDraftWithAI }: Omit<Props, "open">) {
  const [draft, setDraft] = useState<ComponentDraft>(initial ?? { name: "", description: "" });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<unknown>();
  const errors = componentDraftErrors(draft, takenNames);
  const kind = type.toLowerCase();

  async function submit() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSubmit(draft);
      onClose();
    } catch (error) {
      setRefusal(error);
      setSaving(false);
    }
  }

  const nameError = (touched ? errors.name : undefined) ?? fieldErrorOf(refusal, "name");
  return (
    <Modal
      open
      title={initial ? `Edit ${initial.name}` : `New ${kind}`}
      onClose={onClose}
      footer={
        <>
          {onDraftWithAI && !initial && (
            <Button variant="ghost" icon={Sparkles} onClick={onDraftWithAI}>
              Describe it to AI instead
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {initial ? "Save" : `Create ${kind}`}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {refusal !== undefined && !fieldErrorOf(refusal, "name") && <Callout variant="danger" title={errorMessageOf(refusal)} />}
        <FormField label="Name" htmlFor="component-name" error={nameError} required>
          <TextInput
            id="component-name"
            autoFocus
            value={draft.name}
            placeholder={placeholders[type]}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Description" htmlFor="component-description" hint="What it's for, in a sentence.">
          <TextArea id="component-description" rows={2} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        </FormField>
      </Stack>
    </Modal>
  );
}
