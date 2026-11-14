import { useRef, useState } from "react";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";
import Modal from "../primitives/Modal";
import Stack from "../primitives/Stack";

/** What a service's listing says about it in the catalog. */
export interface ServiceListingDraft {
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** The workflow being published, named in the title. Give it to publish one; leave it out to edit a listing. */
  workflowName?: string;
  /** The listing as it stands, when editing; a new one starts from the workflow's name. */
  initial?: ServiceListingDraft;
  /** Saves it; resolves once saved (the modal closes itself), or rejects with why not, shown under its field. */
  onSubmit: (draft: ServiceListingDraft) => Promise<void>;
}

/**
 * Publishing a workflow as a service, or editing a service's listing: the
 * name other teams find it by (an action, "Verify a national ID") and what it
 * does. A workflow with a listing is published; there's no draft.
 */
export default function ServiceListingFormModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <ListingForm {...rest} />;
}

function ListingForm({ onClose, workflowName, initial, onSubmit }: Omit<Props, "open">) {
  const [draft, setDraft] = useState<ServiceListingDraft>(initial ?? { name: workflowName ?? "", description: "" });
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<unknown>();
  const nameRef = useRef<HTMLInputElement>(null);
  const publishing = !initial;

  async function submit() {
    if (saving) return;
    if (!draft.name.trim()) {
      setMissing(true);
      nameRef.current?.focus();
      return;
    }
    setMissing(false);
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSubmit({ name: draft.name.trim(), description: draft.description.trim() });
      onClose();
    } catch (error) {
      setRefusal(error);
      setSaving(false);
    }
  }

  const nameError = (missing ? "Enter a name for the service" : undefined) ?? fieldErrorOf(refusal, "name");
  const descriptionError = fieldErrorOf(refusal, "description");
  const label = publishing ? (saving ? "Publishing…" : "Publish") : saving ? "Saving…" : "Save";
  return (
    <Modal
      open
      title={publishing ? `Publish ${workflowName ?? "workflow"} as a service` : "Edit listing"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button aria-disabled={saving} onClick={() => void submit()}>
            {label}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {publishing && <p>Published, it's listed in the service catalog, where other teams can find it and call it.</p>}
        {refusal !== undefined && !nameError && !descriptionError && <Callout variant="danger" title={errorMessageOf(refusal)} />}
        <FormField label="Name" htmlFor="service-name" error={nameError} hint={'What it does, as an action: "Verify a national ID".'} required>
          <TextInput
            ref={nameRef}
            id="service-name"
            autoFocus
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
          />
        </FormField>
        <FormField label="Description" htmlFor="service-description" error={descriptionError} hint="What it does and what it gives back, in a sentence or two.">
          <TextArea id="service-description" rows={3} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        </FormField>
      </Stack>
    </Modal>
  );
}
