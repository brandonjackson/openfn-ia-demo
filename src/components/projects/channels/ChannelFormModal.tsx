import { useState } from "react";
import {
  projectCredentialOptions,
  webhookAuthMethods,
  type Channel,
} from "../../../mock-data/channels";
import Button from "../../Button";
import { Checkbox, Field, Select, TextInput } from "../../Inputs";
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
      size="md"
      title={channel ? "Edit Channel" : "New Channel"}
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
      <form
        id="channel-form"
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        {channel && (
          <Field label="Proxy URL">
            <ProxyUrlCopy channelId={channel.id} />
          </Field>
        )}
        <TextInput id="channel_name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Toggle checked={enabled} onChange={setEnabled} label="Enabled" />
        <TextInput
          id="channel_destination_url"
          label="Destination URL"
          hint="The service OpenFn will forward requests to"
          placeholder="https://"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
        />
        <Select
          id="channel_destination_credential"
          label={<LabelWithLink to={`/projects/${projectId}/settings#credentials`}>Destination Credential</LabelWithLink>}
          hint="How OpenFn authenticates with the destination service"
          options={[["None", ""], ...projectCredentialOptions.map((pc): [string, string] => [pc.name, pc.id])]}
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
        />
        <Field
          label={<LabelWithLink to={`/projects/${projectId}/settings#webhook_security`}>Client Credentials</LabelWithLink>}
          hint="Credentials that you can use to access this channel"
        >
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
        </Field>
      </form>
    </Modal>
  );
}

/** A field label with an "Add New" link beside it. */
function LabelWithLink({ to, children }: { to: string; children: string }) {
  return (
    <span className="flex items-baseline gap-2">
      {children}
      <TextLink to={to} className="text-xs font-normal">
        Add New
      </TextLink>
    </span>
  );
}
