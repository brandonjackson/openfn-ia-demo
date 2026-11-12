import { useState } from "react";
import { Workflow } from "lucide-react";
import Button from "../../../components/primitives/Button";
import Callout from "../../../components/primitives/Callout";
import Code from "../../../components/primitives/Code";
import EmptyState from "../../../components/primitives/EmptyState";
import LoadingState from "../../../components/primitives/LoadingState";
import SegmentedControl from "../../../components/primitives/SegmentedControl";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { Example } from "../../parts/Example";

/** What shows before there's anything to show. */
export default function EmptyAndLoading() {
  const [state, setState] = useState("Loading");
  return (
    <DocPage
      eyebrow="Guidelines"
      title="Empty and loading states"
      lead="A screen is only blank for a moment, or because there's nothing there yet. Both are a chance to say what's going on and what to do next."
    >
      <Section title="The states of a page">
        <P>A page that loads data has four states. Switch between them:</P>
        <SegmentedControl options={["Loading", "Empty", "Refused", "Not found"]} value={state} onChange={setState} />
        <Example column>
          {state === "Loading" && <LoadingState label="Loading workflows…" />}
          {state === "Empty" && (
            <EmptyState icon={Workflow} title="No workflows yet." description="A workflow moves data between systems when something happens." action={<Button>New workflow</Button>} />
          )}
          {state === "Refused" && (
            <Callout variant="danger" role="alert" title="Couldn't load workflows">
              The server didn't answer. Try again in a moment.
            </Callout>
          )}
          {state === "Not found" && <EmptyState title="We couldn't find that project." description="It may have been deleted, or you may not be a member." />}
        </Example>
      </Section>

      <Section title="Loading">
        <Bullets
          items={[
            <>Wrappers wrap a page in <Code>Loaded</Code>, which shows <Code>LoadingState</Code> while the data loads and Not Found when the record isn't there. Pages never draw their own spinner for their own data.</>,
            <>Label what's loading ("Loading workflows…"): it's read out and shown under the spinner.</>,
            <>Inside a section or a row, use <Code>size="inline"</Code>.</>,
            <>Chrome that's waiting on the API (the instance name, who you are) is left out until it's loaded, not drawn as a placeholder.</>,
          ]}
        />
      </Section>

      <Section title="Empty">
        <Bullets
          items={[
            <>Say what would be here: "No credentials yet.", not "No data".</>,
            <>Add a line on what the thing is for, if a newcomer might not know.</>,
            <>Offer the action that fills it, when the person can take it. Leave it out when they can't.</>,
            <>A search that matches nothing is different from an empty list: "No credentials match", with a way to clear the search.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
