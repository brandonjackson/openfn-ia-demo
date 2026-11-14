import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { AdaptorCatalog, CatalogAdaptor } from "../../model/adaptor-catalog";
import { fieldErrorOf, firstProblemOf, FormError } from "../../model/form-error";
import AdaptorLogo from "./AdaptorLogo";
import ConnectSystemPicker from "./ConnectSystemPicker";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import FormField from "../primitives/FormField";
import Inline from "../primitives/Inline";
import Modal from "../primitives/Modal";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import { TextArea, TextInput } from "../primitives/FormControls";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Every adaptor a system can be connected with, sorted into the categories "Connect a system" shows. */
  catalog: AdaptorCatalog;
  /** Pre-select a system by name (e.g. from "Suggested to add"). */
  preselectedSystem?: string;
  /** Pre-select a system by its adaptor's id (e.g. an adaptor picked in the editor's "Add a step"). Wins over `preselectedSystem`. */
  preselectedAdaptor?: string;
  /**
   * Adds the system. The form waits for it, shows why under the field if
   * it's refused, and closes once it's added. Left out, adding just closes
   * (for stories).
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
  /** Where its OpenAPI spec is; blank for none. */
  openApiSpecUrl: string;
}

const DESCRIPTION_MAX = 240;

/**
 * Connecting a new system, in two steps: "Connect a system" picks what kind
 * of system it is from the same picker as the editor's "Add a step"
 * (`ConnectSystemPicker`, with only what a system can be), then a form names
 * it and says where it lives. Opened with a system already picked (from
 * "Suggested to add", or an adaptor picked in "Add a step"), it starts on the
 * form, which can go back to change it.
 */
export default function AddConnectedSystemFlow({ open, onClose, catalog, preselectedSystem, preselectedAdaptor, onAdd }: Props) {
  const findPreselected = () =>
    preselectedAdaptor
      ? (catalog.adaptors.find((a) => a.id === preselectedAdaptor) ?? null)
      : preselectedSystem
        ? (catalog.adaptors.find((a) => a.name.toLowerCase() === preselectedSystem.toLowerCase()) ?? null)
        : null;
  const [selected, setSelected] = useState<CatalogAdaptor | null>(findPreselected);

  // Re-sync when the modal opens or what's preselected changes while open.
  const [synced, setSynced] = useState({ open, preselectedSystem, preselectedAdaptor });
  if (synced.open !== open || synced.preselectedSystem !== preselectedSystem || synced.preselectedAdaptor !== preselectedAdaptor) {
    setSynced({ open, preselectedSystem, preselectedAdaptor });
    if (open) setSelected(findPreselected());
  }

  if (!open) return null;

  const close = () => {
    setSelected(null);
    onClose();
  };

  if (!selected) {
    return (
      <Modal open title="Connect a system" onClose={close} widthClass="max-w-3xl">
        <ConnectSystemPicker
          catalog={catalog}
          connected={[]}
          purpose="system"
          onSelect={(choice) => {
            if (choice.kind !== "adaptor") return;
            setSelected(catalog.adaptors.find((a) => a.id === choice.adaptor) ?? null);
          }}
        />
      </Modal>
    );
  }
  return <ConfigForm key={selected.id} adaptor={selected} onBack={() => setSelected(null)} onClose={close} onAdd={onAdd} />;
}

/** The second step: the picked system's name, description and where it lives. */
function ConfigForm({
  adaptor,
  onBack,
  onClose,
  onAdd,
}: {
  adaptor: CatalogAdaptor;
  onBack: () => void;
  onClose: () => void;
  onAdd?: Props["onAdd"];
}) {
  const [name, setName] = useState(adaptor.name);
  const [description, setDescription] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [specUrl, setSpecUrl] = useState("");
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const nameInput = useRef<HTMLInputElement>(null);

  const fieldError = (field: string) => fieldErrorOf(error, field);
  const formFields = ["name", "description", "apiDocsUrl", "openApiSpecUrl", "environments.production.url"];
  const unplaced = error !== null && !(error instanceof FormError && formFields.some((f) => fieldError(f)));

  const add = async () => {
    if (saving) return;
    setChecked(true);
    if (!name.trim()) return nameInput.current?.focus();
    setSaving(true);
    setError(null);
    try {
      await onAdd?.({
        name: name.trim(),
        description: description.trim(),
        adaptor: adaptor.id,
        endpointUrl: endpointUrl.trim(),
        docsUrl: docsUrl.trim(),
        openApiSpecUrl: specUrl.trim(),
      });
      onClose();
    } catch (refused) {
      setError(refused);
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Connect ${adaptor.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button aria-disabled={saving || undefined} onClick={() => void add()}>
            {saving ? "Adding…" : "Add connected system"}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Inline gap="md" justify="between">
          <Inline gap="md">
            <AdaptorLogo adaptor={adaptor.id} name={adaptor.name} />
            <Stack gap="none">
              <Text tone="strong">{adaptor.name}</Text>
              <Text size="xs" tone="muted">
                {adaptor.description}
              </Text>
            </Stack>
          </Inline>
          <Button variant="ghost" size="xs" icon={ChevronLeft} onClick={onBack}>
            Change system
          </Button>
        </Inline>
        {unplaced && (
          <Callout variant="danger" title="That wasn't added">
            {firstProblemOf(error)}
          </Callout>
        )}
        <FormField
          label="Name"
          htmlFor="new-system-name"
          required
          hint="A display name for this connected system."
          error={checked && !name.trim() ? "Enter a name" : fieldError("name")}
        >
          <TextInput id="new-system-name" ref={nameInput} autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField
          label="Description"
          htmlFor="new-system-description"
          optional
          hint={`${description.length}/${DESCRIPTION_MAX} characters`}
          error={fieldError("description")}
        >
          <TextArea
            id="new-system-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this system is used for..."
            rows={3}
            maxLength={DESCRIPTION_MAX}
          />
        </FormField>
        <FormField
          label="Endpoint URL"
          htmlFor="new-system-url"
          optional
          hint="The base URL of the system's API, in production."
          error={fieldError("environments.production.url")}
        >
          <TextInput id="new-system-url" type="url" value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} placeholder="https://" />
        </FormField>
        <FormField label="API docs" htmlFor="new-system-docs" optional hint="Where people read about its API." error={fieldError("apiDocsUrl")}>
          <TextInput id="new-system-docs" type="url" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} placeholder="https://" />
        </FormField>
        <FormField
          label="OpenAPI spec"
          htmlFor="new-system-openapi"
          optional
          hint="The URL of its OpenAPI (Swagger) file, in JSON or YAML."
          error={fieldError("openApiSpecUrl")}
        >
          <TextInput id="new-system-openapi" type="url" value={specUrl} onChange={(e) => setSpecUrl(e.target.value)} placeholder="https://" />
        </FormField>
      </Stack>
    </Modal>
  );
}
