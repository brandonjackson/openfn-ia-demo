import { useState } from "react";
import type { ChannelType } from "../../model/page-data";
import { channelDraftErrors, type ChannelDraft } from "../../model/channels";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import FormField from "../primitives/FormField";
import ToggleSwitch from "../primitives/ToggleSwitch";
import CopyValue from "../primitives/CopyValue";
import { RadioOption, Select, TextArea, TextInput } from "../primitives/FormControls";
import { channelTypeConfig } from "./channel-types";

const kinds: { id: ChannelType; hint: string }[] = [
  { id: "event", hint: "Another system sends requests to an address OpenFn gives it, and they start your workflows." },
  { id: "read", hint: "Your workflows fetch data from another system through it." },
  { id: "write", hint: "Your workflows send data to another system through it." },
];

interface Props {
  open: boolean;
  /** The channel being edited; without it, a new one is being made. */
  initial?: ChannelDraft;
  /** Names used by the project's other channels. */
  takenNames: string[];
  /** The project's credentials, by name, to call the system with. */
  credentials: string[];
  /** Where an event channel with this name would listen. */
  eventAddress: (name: string) => string;
  onClose: () => void;
  onSubmit: (draft: ChannelDraft) => Promise<void>;
}

const blank: ChannelDraft = { name: "", description: "", channelType: "write", system: "", destinationUrl: "", enabled: true };

/**
 * Making or editing a channel, as in Lightning: its name, whether it's on,
 * the system on the other end and, for one that calls out, the address to
 * forward to and the credential to sign in with. An event channel is given
 * an address of its own to share instead.
 */
export default function ChannelFormModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <ChannelForm {...rest} />;
}

function ChannelForm({ initial, takenNames, credentials, eventAddress, onClose, onSubmit }: Omit<Props, "open">) {
  const [draft, setDraft] = useState<ChannelDraft>(initial ?? blank);
  const [touched, setTouched] = useState(false);
  const errors = channelDraftErrors(draft, takenNames);
  const set = (change: Partial<ChannelDraft>) => setDraft((d) => ({ ...d, ...change }));
  const show = (field: keyof typeof errors) => (touched ? errors[field] : undefined);

  async function submit() {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    await onSubmit(draft);
    onClose();
  }

  return (
    <Modal
      open
      title={initial ? `Edit ${initial.name}` : "New channel"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{initial ? "Save" : "Create channel"}</Button>
        </>
      }
    >
      <Stack gap="lg">
        <FormField label="Name" htmlFor="channel-name" error={show("name")}>
          <TextInput id="channel-name" autoFocus value={draft.name} placeholder="dhis2-send-events" onChange={(e) => set({ name: e.target.value })} />
        </FormField>
        <FormField label="Description" htmlFor="channel-description">
          <TextArea id="channel-description" rows={2} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
        </FormField>
        {!initial && (
          <Stack gap="sm">
            <Text tone="strong">Kind</Text>
            {kinds.map((k) => (
              <RadioOption
                key={k.id}
                name="channel-kind"
                value={k.id}
                label={channelTypeConfig[k.id].label}
                hint={k.hint}
                checked={draft.channelType === k.id}
                onChange={() => set({ channelType: k.id })}
              />
            ))}
          </Stack>
        )}
        <FormField label="System" htmlFor="channel-system" hint="The system on the other end, e.g. DHIS2." error={show("system")}>
          <TextInput id="channel-system" value={draft.system} onChange={(e) => set({ system: e.target.value })} />
        </FormField>
        {draft.channelType === "event" ? (
          <Stack gap="xs">
            <Text tone="strong">Address</Text>
            <CopyValue value={eventAddress(draft.name || "my-channel")} />
            <Text tone="muted" size="xs">
              Give this to the system that sends the events.
            </Text>
          </Stack>
        ) : (
          <>
            <FormField label="Destination URL" htmlFor="channel-url" hint="The service OpenFn forwards requests to." error={show("destinationUrl")}>
              <TextInput id="channel-url" placeholder="https://" value={draft.destinationUrl} onChange={(e) => set({ destinationUrl: e.target.value })} />
            </FormField>
            <FormField label="Destination credential" htmlFor="channel-credential" hint="How OpenFn signs in to the destination.">
              <Select
                id="channel-credential"
                fullWidth
                placeholder="None"
                options={credentials}
                value={draft.credential ?? ""}
                onChange={(e) => set({ credential: e.target.value || undefined })}
              />
            </FormField>
          </>
        )}
        <ToggleSwitch checked={draft.enabled} label="Enabled" onChange={(enabled) => set({ enabled })} />
      </Stack>
    </Modal>
  );
}
