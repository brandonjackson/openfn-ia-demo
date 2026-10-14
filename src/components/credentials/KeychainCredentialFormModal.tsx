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
      title={<span className="font-bold">{kc ? `Edit ${kc.name || "keychain credential"}` : "Create keychain credential"}</span>}
      width="max-w-[50rem]"
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
      <form id={`keychain-credential-form-${kc?.id ?? "new"}`} className="text-left" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6 bg-white py-5">
          <fieldset>
            <div className="space-y-4">
              <div>
                <TextInput label="Name" placeholder="Enter keychain credential name" value={name} onChange={(e) => setName(e.target.value)} />
                <p className="mt-1 text-sm text-gray-500">A descriptive name for this keychain credential</p>
              </div>
              <div>
                <TextInput label="JSONPath Expression" placeholder="$.user_id" value={path} onChange={(e) => setPath(e.target.value)} />
                <p className="mt-1 text-sm text-gray-500">JSONPath expression to extract credential selector from run data</p>
              </div>
              <div>
                <Select
                  label="Default Credential"
                  value={defaultId}
                  onChange={(e) => setDefaultId(e.target.value)}
                  options={[["No default credential", ""], ...credentials.map((c): [string, string] => [c.name, c.id])]}
                />
                <p className="mt-1 text-sm text-gray-500">Credential to use when JSONPath expression doesn't match</p>
              </div>
            </div>
          </fieldset>
        </div>
      </form>
    </Modal>
  );
}
