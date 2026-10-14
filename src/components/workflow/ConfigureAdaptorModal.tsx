import { credentials, ownerEmail } from "../../mock-data/credentials";
import { ADAPTORS_WITHOUT_CREDENTIALS, adaptorDisplayName, adaptorShortName, resolveAdaptor, resolvedAdaptorVersion } from "../../mock-data/adaptors";
import AdaptorIcon from "./AdaptorIcon";
import EditorDialog from "./EditorDialog";

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
    <EditorDialog open={isOpen} onClose={onClose} className="sm:max-w-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold leading-5 text-zinc-800">Configure connection</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none" aria-label="Close">
          <span className="hero-x-mark h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="col-span-2">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              Adaptor
              <span
                className="hero-information-circle h-4 w-4 text-gray-400"
                title="Choose an adaptor to perform operations (via helper functions) in a specific application. Pick 'http' for generic REST APIs or the 'common' adaptor if this job only performs data manipulation."
              />
            </span>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <AdaptorIcon name={adaptor} size="md" />
                <span className="font-medium text-gray-900 truncate">{adaptorDisplayName(adaptor)}</span>
              </div>
              <button
                type="button"
                onClick={onChangeAdaptor}
                aria-label="Change adaptor"
                className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex-shrink-0"
              >
                Change
              </button>
            </div>
          </div>
          <div className="col-span-1">
            <span className="block text-sm font-medium text-gray-700 mb-2">Version</span>
            <select
              value={version}
              onChange={(e) => onVersionChange(e.target.value)}
              className="block w-full rounded-md border-secondary-300 shadow-xs sm:text-sm focus:border-primary-300 focus:ring focus:ring-primary-200/50 py-3"
            >
              {versions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              Credentials
              <span className="hero-information-circle h-4 w-4 text-gray-400" />
            </span>
            {needsCredentials && (
              <button type="button" className="text-primary-600 hover:text-primary-700 text-sm font-medium underline focus:outline-none">
                New Credential
              </button>
            )}
          </div>
          {!needsCredentials ? (
            <div className="border border-gray-200 rounded-md p-6 text-center bg-gray-50">
              <p className="text-gray-600 text-sm">This adaptor does not require credentials.</p>
            </div>
          ) : shown.length === 0 ? (
            <div className="border border-gray-200 rounded-md p-6 text-center">
              <p className="text-gray-500 mb-3">No credentials found in this project</p>
              <button type="button" className="text-primary-600 hover:text-primary-700 text-sm font-medium underline focus:outline-none">
                Create a new credential
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-48 overflow-y-auto">
              {shown.map((c) => {
                const selected = c.name === credentialName;
                return (
                  <label key={c.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="credential"
                      checked={selected}
                      onChange={() => onCredentialChange(c.name)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="font-medium text-gray-900 truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span className="hero-user-solid h-4 w-4" />
                        {ownerEmail(c.ownerId)}
                      </div>
                    </div>
                    {selected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onCredentialChange(null);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end px-6 py-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md text-sm font-semibold shadow-xs px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white"
        >
          Close
        </button>
      </div>
    </EditorDialog>
  );
}
