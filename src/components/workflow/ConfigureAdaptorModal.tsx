import { credentials, ownerEmail } from "../../mock-data/credentials";
import { ADAPTORS_WITHOUT_CREDENTIALS, adaptorDisplayName, adaptorShortName, resolveAdaptor, resolvedAdaptorVersion } from "../../mock-data/adaptors";
import Button from "../Button";
import InfoTooltip from "../InfoTooltip";
import { Field, Label, Radio, Select } from "../Inputs";
import Modal from "../Modal";
import TextLink from "../TextLink";
import { ADAPTOR_HELP } from "./AdaptorDisplay";
import AdaptorIcon from "./AdaptorIcon";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  adaptor: string;
  credentialName: string | null;
  onChangeAdaptor: () => void;
  onVersionChange: (version: string) => void;
  onCredentialChange: (credentialName: string | null) => void;
}

/**
 * "Configure connection" (ConfigureAdaptorModal.tsx): the adaptor with a
 * Change button, its version, and the project credentials that match it.
 * Creating or editing a credential isn't wired up in the demo.
 */
export default function ConfigureAdaptorModal({
  isOpen,
  onClose,
  projectId,
  adaptor,
  credentialName,
  onChangeAdaptor,
  onVersionChange,
  onCredentialChange,
}: Props) {
  const short = adaptorShortName(adaptor);
  const needsCredentials = !ADAPTORS_WITHOUT_CREDENTIALS.includes(short);
  const projectCreds = credentials.filter((c) => c.projectIds.includes(projectId));
  const matched = projectCreds.filter((c) => c.schema === short);
  const shown = matched.length > 0 ? matched : projectCreds;
  const { version } = resolveAdaptor(adaptor);
  const latest = resolvedAdaptorVersion(adaptor);
  const versions = ["latest", latest, "6.5.1", "6.4.0", "5.0.0"].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      title="Configure connection"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 items-end gap-4">
          <Field className="col-span-2" label={<>Adaptor<InfoTooltip title={ADAPTOR_HELP} /></>}>
            <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <AdaptorIcon name={adaptor} size="md" />
                <span className="truncate font-medium text-gray-900">{adaptorDisplayName(adaptor)}</span>
              </div>
              <Button theme="secondary" size="sm" onClick={onChangeAdaptor} aria-label="Change adaptor">
                Change
              </Button>
            </div>
          </Field>
          <Select
            id="adaptor-version"
            label="Version"
            options={versions}
            value={version}
            onChange={(e) => onVersionChange(e.target.value)}
            className="py-3"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Credentials</Label>
            {needsCredentials && <TextLink className="text-sm font-medium">New Credential</TextLink>}
          </div>
          {!needsCredentials ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">This adaptor does not require credentials.</p>
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-md border border-gray-200 p-6 text-center">
              <p className="mb-3 text-gray-500">No credentials found in this project</p>
              <TextLink className="text-sm font-medium">Create a new credential</TextLink>
            </div>
          ) : (
            <div className="max-h-48 divide-y divide-gray-200 overflow-y-auto rounded-md border border-gray-200">
              {shown.map((c) => {
                const selected = c.name === credentialName;
                return (
                  <div key={c.id} className="flex items-start justify-between gap-3 p-4 hover:bg-gray-50">
                    <Radio
                      name="credential"
                      checked={selected}
                      onChange={() => onCredentialChange(c.name)}
                      label={<span className="font-medium text-gray-900">{c.name}</span>}
                      hint={
                        <span className="flex items-center gap-1 text-sm">
                          <span className="hero-user-solid h-4 w-4" />
                          {ownerEmail(c.ownerId)}
                        </span>
                      }
                    />
                    {selected && (
                      <TextLink className="text-sm" onClick={() => onCredentialChange(null)}>
                        Clear
                      </TextLink>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
