import { useState } from "react";
import {
  projectCredentialOptions,
  webhookAuthMethods,
  type Channel,
} from "../../../mock-data/channels";
import Button from "../../Button";
import { Checkbox, TextInput } from "../../Inputs";
import Modal from "../../Modal";
import Toggle from "../../Toggle";
import TextLink from "../../TextLink";
import ProxyUrlCopy from "./ProxyUrlCopy";

/**
 * New / Edit Channel (ChannelLive.FormComponent): the proxy URL when editing,
 * then Name, Enabled, Destination URL, Destination Credential and Client
 * Credentials. Save just closes.
 */
export default function ChannelFormModal({
  channel,
  projectId,
  onClose,
}: {
  /** The channel being edited; omit for New Channel. */
  channel?: Channel;
  projectId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(channel?.name ?? "");
  const [enabled, setEnabled] = useState(channel?.enabled ?? true);
  const [destinationUrl, setDestinationUrl] = useState(channel?.destinationUrl ?? "");
  const [credentialId, setCredentialId] = useState(channel?.destinationCredentialId ?? "");
  const [clients, setClients] = useState<string[]>(channel?.clientAuthMethodIds ?? []);

  return (
    <Modal
      open
      onClose={onClose}
      width="w-full max-w-lg"
      title={<span className="font-bold">{channel ? "Edit Channel" : "New Channel"}</span>}
      footer={
        <>
          <Button type="submit" form="channel-form" theme="primary">
            Save
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      {channel && (
        <div className="mb-4" title="Copy proxy URL">
          <label className="block text-sm font-medium leading-6 text-gray-900">Proxy URL</label>
          <ProxyUrlCopy channelId={channel.id} className="mt-1 min-w-0 hover:text-gray-600" textClassName="text-gray-500" />
        </div>
      )}
      <form
        id="channel-form"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className="space-y-6 bg-white">
          <TextInput id="channel_name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Toggle checked={enabled} onChange={setEnabled} label="Enabled" />
          <div>
            <TextInput
              id="channel_destination_url"
              label="Destination URL"
              placeholder="https://"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">The service OpenFn will forward requests to</p>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-sm/6 font-medium text-slate-800">Destination Credential</p>
              <TextLink to={`/projects/${projectId}/settings#credentials`} className="text-xs">
                Add New
              </TextLink>
            </div>
            <p className="mb-2 text-xs text-gray-500">How OpenFn authenticates with the destination service</p>
            <select
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200/50 sm:text-sm"
            >
              <option value="">None</option>
              {projectCredentialOptions.map((pc) => (
                <option key={pc.id} value={pc.id}>
                  {pc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-sm/6 font-medium text-slate-800">Client Credentials</p>
              <TextLink to={`/projects/${projectId}/settings#webhook_security`} className="text-xs">
                Add New
              </TextLink>
            </div>
            <p className="mb-2 text-xs text-gray-500">Credentials that you can use to access this channel</p>
            {webhookAuthMethods.length === 0 ? (
              <p className="italic text-xs text-gray-400">No webhook auth methods available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {webhookAuthMethods.map((wam) => (
                  <Checkbox
                    key={wam.id}
                    id={`client_auth_${wam.id}`}
                    label={wam.name}
                    checked={clients.includes(wam.id)}
                    onChange={(e) =>
                      setClients((ids) => (e.target.checked ? [...ids, wam.id] : ids.filter((id) => id !== wam.id)))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
