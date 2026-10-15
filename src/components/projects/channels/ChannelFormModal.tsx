import { useState } from "react";
import type { Channel } from "../../../types/channels";
import FormModal from "../../FormModal";
import { Checkbox, Field, Select, TextInput } from "../../Inputs";
import Toggle from "../../Toggle";
import TextLink from "../../TextLink";
import { useToast } from "../../Toast";
import ProxyUrlCopy from "./ProxyUrlCopy";

/**
 * New / Edit Channel (ChannelLive.FormComponent): the proxy URL when editing,
 * then Name, Enabled, Destination URL, Destination Credential and Client
 * Credentials. Save just closes.
 */
export default function ChannelFormModal({
  channel,
  projectId,
  credentialOptions,
  authMethodOptions,
  onClose,
}: {
  /** The channel being edited; omit for New Channel. */
  channel?: Channel;
  projectId: string;
  /** Project credentials (Destination Credential select). */
  credentialOptions: { id: string; name: string }[];
  /** The project's webhook auth methods (Client Credentials checkboxes). */
  authMethodOptions: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [name, setName] = useState(channel?.name ?? "");
  const [enabled, setEnabled] = useState(channel?.enabled ?? true);
  const [destinationUrl, setDestinationUrl] = useState(channel?.destinationUrl ?? "");
  const [credentialId, setCredentialId] = useState(channel?.destinationCredentialId ?? "");
  const [clients, setClients] = useState<string[]>(channel?.clientAuthMethodIds ?? []);
  const toast = useToast();

  return (
    <FormModal
      open
      onClose={onClose}
      size="md"
      title={channel ? "Edit Channel" : "New Channel"}
      formId="channel-form"
      onSubmit={() => {
        onClose();
        toast(channel ? "Channel updated successfully." : "Channel created successfully.");
      }}
      submitLabel="Save"
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
        options={[["None", ""], ...credentialOptions.map((pc): [string, string] => [pc.name, pc.id])]}
        value={credentialId}
        onChange={(e) => setCredentialId(e.target.value)}
      />
      <Field
        label={<LabelWithLink to={`/projects/${projectId}/settings#webhook_security`}>Client Credentials</LabelWithLink>}
        hint="Credentials that you can use to access this channel"
      >
        {authMethodOptions.length === 0 ? (
          <p className="italic text-xs text-gray-400">No webhook auth methods available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {authMethodOptions.map((wam) => (
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
    </FormModal>
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
