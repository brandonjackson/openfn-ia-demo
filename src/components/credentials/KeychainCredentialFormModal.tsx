import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import { Select, TextInput } from "../Inputs";
import { currentUser } from "../../mock-data/users";
import type { Credential, KeychainCredential } from "../../mock-data/credentials";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** Set to edit an existing keychain credential. */
  keychainCredential?: KeychainCredential;
  /** The project's credentials, offered as the default. */
  credentials: Credential[];
  onSave?: (keychain: KeychainCredential) => void;
}

/**
 * Lightning's `keychain_credential_form` (live/components/credentials.ex):
 * a name, a JSONPath that selects the credential at run time, and a default.
 */
export default function KeychainCredentialFormModal({
  open,
  onClose,
  projectId,
  keychainCredential: kc,
  credentials,
  onSave,
}: Props) {
  const [name, setName] = useState(kc?.name ?? "");
  const [path, setPath] = useState(kc?.path ?? "");
  const [defaultId, setDefaultId] = useState(kc?.defaultCredentialId ?? "");
  const valid = name.trim() !== "" && path.trim() !== "";

  const save = () => {
    onSave?.({
      id: kc?.id ?? `kc-${Date.now()}`,
      name: name.trim(),
      path: path.trim(),
      defaultCredentialId: defaultId || null,
      projectId,
      createdById: kc?.createdById ?? currentUser.id,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={kc ? `Edit ${kc.name || "keychain credential"}` : "Create keychain credential"}
      size="xl"
      footer={
        <>
          <Button id={`save-keychain-credential-button-${kc?.id ?? "new"}`} disabled={!valid} onClick={save}>
            {kc ? "Save Changes" : "Create"}
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <form id={`keychain-credential-form-${kc?.id ?? "new"}`} className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <TextInput
          label="Name"
          hint="A descriptive name for this keychain credential"
          placeholder="Enter keychain credential name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          label="JSONPath Expression"
          hint="JSONPath expression to extract credential selector from run data"
          placeholder="$.user_id"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
        <Select
          label="Default Credential"
          hint="Credential to use when JSONPath expression doesn't match"
          value={defaultId}
          onChange={(e) => setDefaultId(e.target.value)}
          options={[["No default credential", ""], ...credentials.map((c): [string, string] => [c.name, c.id])]}
        />
      </form>
    </Modal>
  );
}
