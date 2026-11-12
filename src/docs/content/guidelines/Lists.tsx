import { useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import ListPage from "../../../components/patterns/ListPage";
import PageHeader from "../../../components/patterns/PageHeader";
import Badge from "../../../components/primitives/Badge";
import Button from "../../../components/primitives/Button";
import Callout from "../../../components/primitives/Callout";
import Code from "../../../components/primitives/Code";
import EmptyState from "../../../components/primitives/EmptyState";
import Inline from "../../../components/primitives/Inline";
import ListGroup from "../../../components/primitives/ListGroup";
import ListRow from "../../../components/primitives/ListRow";
import SearchInput from "../../../components/primitives/SearchInput";
import Stack from "../../../components/primitives/Stack";
import Text from "../../../components/primitives/Text";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { Example } from "../../parts/Example";

const credentials = [
  { name: "DHIS2 production", kind: "DHIS2", owner: "Amara", shared: true },
  { name: "Salesforce sandbox", kind: "Salesforce", owner: "Amara", shared: false },
  { name: "CommCare reporting", kind: "CommCare", owner: "Jonas", shared: true },
];

/** The order every list page follows, live. */
function CredentialsList() {
  const [query, setQuery] = useState("");
  const shown = credentials.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const groups = [
    { title: "Shared with this project", rows: shown.filter((c) => c.shared) },
    { title: "Only yours", rows: shown.filter((c) => !c.shared) },
  ].filter((g) => g.rows.length);
  return (
    <ListPage
      header={<PageHeader title="Credentials" description="How workflows sign in to the systems they connect." actions={<Button icon={Plus}>New credential</Button>} />}
      toolbar={
        <Inline>
          <Stack grow>
            <SearchInput placeholder="Search credentials" value={query} onChange={(e) => setQuery(e.target.value)} />
          </Stack>
        </Inline>
      }
      summary={
        <Text tone="muted" role="status">
          {shown.length} {shown.length === 1 ? "credential" : "credentials"}
        </Text>
      }
      isEmpty={shown.length === 0}
      empty={<EmptyState icon={KeyRound} title="No credentials match." description="Try another search." />}
    >
      <Stack gap="xl">
        {groups.map((g) => (
          <ListGroup key={g.title} title={g.title} count={g.rows.length}>
            {g.rows.map((c) => (
                  <ListRow
                    key={c.name}
                    icon={KeyRound}
                    title={c.name}
                    badges={<Badge label={c.kind} shape="tag" />}
                    description={`Owned by ${c.owner}`}
                    onClick={() => {}}
                  />
            ))}
          </ListGroup>
        ))}
      </Stack>
    </ListPage>
  );
}

/** How lists of things are laid out and filtered. */
export default function Lists() {
  return (
    <DocPage
      eyebrow="Guidelines"
      title="Lists"
      lead="Projects, workflows, credentials, channels, history: much of OpenFn is a list of things. Every list page is laid out in the same order, so people always know where the filters, the count and the list are."
    >
      <Section title="Try it">
        <Example backdrop column>
          <CredentialsList />
        </Example>
      </Section>

      <Section title="One order, every time">
        <P>
          <Code>ListPage</Code> holds the order, so an intro can never end up between the filters and the list they filter:
        </P>
        <Bullets
          ordered
          items={[
            <><Code>header</Code>: a <Code>PageHeader</Code> with the main action ("New credential").</>,
            <><Code>notice</Code>: what an action just did, as a <Code>Callout</Code>.</>,
            <><Code>intro</Code>: optional, what the list is for, above the toolbar.</>,
            <><Code>toolbar</Code>: search, sort, filters, a view switch. Never in a heading or the header's actions.</>,
            <><Code>summary</Code>: the count, which a search narrows. Give it <Code>role="status"</Code> so the change is read out.</>,
            <>The list itself, or <Code>empty</Code> when <Code>isEmpty</Code>.</>,
            <><Code>after</Code>: sections that follow, such as suggestions of what to add.</>,
          ]}
        />
      </Section>

      <Section title="Groups and rows">
        <P>
          Split a long list into groups with <Code>ListGroup</Code>, the small uppercase heading with a count, and put the
          groups in a <Code>Stack gap="xl"</Code>. A list never heads its groups any other way. Each row is a{" "}
          <Code>ListRow</Code>, a card of its own, straight inside the group. Rows that open to show more are{" "}
          <Code>ExpandableRow</Code>s in a <Code>Card flush</Code> and a <Code>Stack divided</Code>, and a table of records
          is a <Code>DataTable</Code>.
        </P>
        <Callout title="Filters say what they're set to">
          Over a long list like History, each filter is a <Code>FilterChip</Code> that reads as a sentence: "Workflow is any",
          "Status is failed or crashed". Keep filters and the page number in the URL, so a filtered list can be shared.
        </Callout>
      </Section>
    </DocPage>
  );
}
