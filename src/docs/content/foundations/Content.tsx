import Button from "../../../components/primitives/Button";
import Callout from "../../../components/primitives/Callout";
import Code from "../../../components/primitives/Code";
import DataTable from "../../../components/primitives/DataTable";
import EmptyState from "../../../components/primitives/EmptyState";
import FormField from "../../../components/primitives/FormField";
import { TextInput } from "../../../components/primitives/FormControls";
import Text from "../../../components/primitives/Text";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { DoDont } from "../../parts/Example";

const words = [
  { say: "New workflow", not: "New Workflow, Create New Workflow", why: "Sentence case, and the shortest label that's clear." },
  { say: "Enter a project name", not: "Name is required, Validation failed", why: "Say what to do, not what's wrong with them." },
  { say: "Saving…", not: "Please wait, Processing", why: "Say what's happening to their thing." },
  { say: "Verify a national ID", not: "National ID service, NID API", why: "Name services as actions, not resources." },
  { say: "Delete project", not: "Delete, OK, Yes", why: "A confirm button says what it does." },
  { say: "No credentials yet.", not: "No data, Empty", why: "An empty list says what would be there." },
];

/** Voice, tone and the words we use. */
export default function Content() {
  return (
    <DocPage
      eyebrow="Foundations"
      title="Content"
      lead="Words are most of the interface. OpenFn's should sound like a helpful colleague: plain, brief and specific about what happened and what to do next."
    >
      <Section title="Voice">
        <Bullets
          items={[
            <><strong>Plain.</strong> Many of the people using OpenFn aren't developers, and many don't have English as a first language. Prefer short, common words.</>,
            <><strong>Specific.</strong> "Couldn't connect to DHIS2: the credential's password was rejected" beats "Something went wrong".</>,
            <><strong>Calm.</strong> No exclamation marks, no blame. A failed run is information, not an emergency.</>,
            <><strong>Brief.</strong> Say it once. A description under a title doesn't repeat the title.</>,
          ]}
        />
      </Section>

      <Section title="Say this, not that">
        <DataTable
          rows={words}
          getRowKey={(r) => r.say}
          columns={[
            { key: "say", header: "Say", render: (r) => <Text tone="success">{r.say}</Text> },
            { key: "not", header: "Not", render: (r) => <Text tone="danger">{r.not}</Text> },
            { key: "why", header: "Why", render: (r) => <Text tone="muted">{r.why}</Text> },
          ]}
        />
      </Section>

      <Section title="Labels and buttons">
        <P>
          Button labels use sentence case and start with a verb: "New workflow", "Save changes", "Invite people". A confirm
          button repeats the action ("Delete project"), so someone skimming the dialog still knows what they're agreeing to.
        </P>
        <DoDont
          doExample={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button variant="danger">Delete project</Button>
            </>
          }
          doText="The button says exactly what will happen."
          dontExample={
            <>
              <Button variant="secondary">No</Button>
              <Button variant="danger">Yes</Button>
            </>
          }
          dontText="Yes to what? People skim dialogs."
        />
      </Section>

      <Section title="Errors">
        <P>
          An error says what's wrong and how to fix it, next to the thing it's about. A refusal from the server shows the
          server's message (an <Code>ApiError</Code>'s <Code>message</Code>), under the field it names when it names one.
        </P>
        <DoDont
          doExample={
            <FormField label="Project name" htmlFor="docs-name-do" error="Enter a project name">
              <TextInput id="docs-name-do" />
            </FormField>
          }
          doText="Under the field, saying what to do."
          dontExample={<Callout variant="danger" title="Error 422">Validation failed.</Callout>}
          dontText="A code and a generic message, away from the field."
        />
      </Section>

      <Section title="Empty states">
        <P>Say what would be here, and offer the way to add it when they can.</P>
        <EmptyState title="No credentials yet." description="Credentials let workflows sign in to the systems they connect." action={<Button>New credential</Button>} />
      </Section>

      <Section title="Spelling and names">
        <Bullets
          items={[
            <>OpenFn, Lightning, X-Road and the names of the systems we connect are written as their owners write them (DHIS2, Salesforce, CommCare).</>,
            <>Names people give things are URL-safe where Lightning's are, and the form shows what a typed name becomes (<Code>planning-intake</Code>).</>,
            <>Ids are shown whole and monospaced: <Code>wo-8f2a91</Code>.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
