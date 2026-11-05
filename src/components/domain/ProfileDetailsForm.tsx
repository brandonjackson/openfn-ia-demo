import { useState } from "react";
import type { ContactPreference, ProfileDetails } from "../../model/page-data";
import { CONTACT_PREFERENCES } from "../../model/page-data";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import Grid from "../primitives/Grid";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** Your name and contact preference as saved. */
  details: ProfileDetails;
  /** Saves them; rejects with a message if the server says no. */
  onSave: (details: ProfileDetails) => Promise<void>;
}

/**
 * Your name and how often OpenFn gets in touch. Save stays off until
 * something changes, and both names are required.
 */
export default function ProfileDetailsForm({ details, onSave }: Props) {
  const [draft, setDraft] = useState(details);
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string }>();
  const [busy, setBusy] = useState(false);

  const changed =
    draft.firstName !== details.firstName ||
    draft.lastName !== details.lastName ||
    draft.contactPreference !== details.contactPreference;
  const errors = {
    firstName: draft.firstName.trim() ? undefined : "can't be blank",
    lastName: draft.lastName.trim() ? undefined : "can't be blank",
  };
  const valid = !errors.firstName && !errors.lastName;

  const save = async () => {
    setBusy(true);
    setStatus(undefined);
    try {
      await onSave({ ...draft, firstName: draft.firstName.trim(), lastName: draft.lastName.trim() });
      setStatus({ tone: "success", message: "User information updated successfully" });
    } catch (e) {
      setStatus({ tone: "danger", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Basic information" description="Change your name and how often we contact you.">
      <Stack gap="md">
        <Grid columns={2}>
          <FormField label="First name" htmlFor="first-name" required error={errors.firstName}>
            <TextInput
              id="first-name"
              autoComplete="given-name"
              value={draft.firstName}
              onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
            />
          </FormField>
          <FormField label="Last name" htmlFor="last-name" required error={errors.lastName}>
            <TextInput
              id="last-name"
              autoComplete="family-name"
              value={draft.lastName}
              onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
            />
          </FormField>
        </Grid>
        <FormField
          label="Contact preference"
          htmlFor="contact-preference"
          hint="Choose 'Anytime' to hear about everything, or 'Critical only' for issues affecting your projects and account."
        >
          <Select
            id="contact-preference"
            options={CONTACT_PREFERENCES}
            value={draft.contactPreference}
            onChange={(e) => setDraft({ ...draft, contactPreference: e.target.value as ContactPreference })}
          />
        </FormField>
        <Inline justify="end" gap="md">
          {status && <Text tone={status.tone}>{status.message}</Text>}
          <Button disabled={busy || !changed || !valid} onClick={save}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </Inline>
      </Stack>
    </Card>
  );
}
