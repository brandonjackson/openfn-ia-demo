import PageHeader from "../../../components/patterns/PageHeader";
import Card from "../../../components/primitives/Card";
import Code from "../../../components/primitives/Code";
import DataTable from "../../../components/primitives/DataTable";
import SectionHeading from "../../../components/primitives/SectionHeading";
import Stack from "../../../components/primitives/Stack";
import Text, { type TextTone } from "../../../components/primitives/Text";
import TextLink from "../../../components/primitives/TextLink";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { DoDont, Example } from "../../parts/Example";

const tones: { tone: TextTone; use: string }[] = [
  { tone: "strong", use: "Names and values that lead a row" },
  { tone: "default", use: "Body copy" },
  { tone: "muted", use: "Secondary detail: timestamps, counts, hints" },
  { tone: "subtle", use: "The quietest detail, such as an id beside a name" },
  { tone: "danger", use: "Something went wrong" },
  { tone: "success", use: "Something went right" },
];

/** Type: the few sizes and tones, and where headings come from. */
export default function Typography() {
  return (
    <DocPage
      eyebrow="Foundations"
      title="Typography"
      lead="OpenFn is a dense, working interface, so type is small, calm and consistent. There are only a few sizes and tones, and components choose them, so a page never picks a font size for itself."
    >
      <Section title="Text">
        <P>
          Words in a component or page go through <TextLink to="/docs/components/Text" variant="inline">Text</TextLink>. It
          comes in three sizes (<Code>xs</Code> 12px, <Code>sm</Code> 14px, the default, and <Code>md</Code> 16px) and the
          tones below.
        </P>
        <DataTable
          rows={tones}
          getRowKey={(r) => r.tone}
          columns={[
            { key: "tone", header: "Tone", render: (r) => <Code>{r.tone}</Code> },
            { key: "sample", header: "Looks like", render: (r) => <Text tone={r.tone}>Nightly sync to DHIS2</Text> },
            { key: "use", header: "For", render: (r) => <Text tone="muted">{r.use}</Text> },
          ]}
        />
        <Example
          code={`<Text tone="strong">Patient intake</Text>
<Text tone="muted" size="xs">Updated 3 minutes ago</Text>
<Text mono tone="subtle">wo-8f2a91</Text>
<Text truncate>A very long description that cuts off with an ellipsis…</Text>`}
          column
        >
          <Text tone="strong">Patient intake</Text>
          <Text tone="muted" size="xs">
            Updated 3 minutes ago
          </Text>
          <Text mono tone="subtle">
            wo-8f2a91
          </Text>
          <Text truncate>A very long description that cuts off with an ellipsis when there's no more room for it on the line</Text>
        </Example>
      </Section>

      <Section title="Headings">
        <P>
          Headings come from the components that own them, so their sizes and spacing match everywhere. A page's title is{" "}
          <TextLink to="/docs/components/PageHeader" variant="inline">PageHeader</TextLink>; a section's is{" "}
          <TextLink to="/docs/components/SectionHeading" variant="inline">SectionHeading</TextLink>; a card's is its{" "}
          <Code>title</Code>; a group of rows is <Code>ListGroup</Code>, the small uppercase label.
        </P>
        <Example backdrop column code={`<PageHeader title="Project settings" description="Members, credentials and data retention." />
<SectionHeading title="Members" count={4} description="Who can see and change this project." />
<SectionHeading variant="label" title="Active" />
<Card title="Data retention" description="How long run data is kept." />`}>
          <PageHeader title="Project settings" description="Members, credentials and data retention." />
          <SectionHeading title="Members" count={4} description="Who can see and change this project." />
          <SectionHeading variant="label" title="Active" />
          <Card title="Data retention" description="How long run data is kept." />
        </Example>
      </Section>

      <Section title="Fonts">
        <Bullets
          items={[
            <><strong>Sans</strong> is the system font stack by default (<Code>--font-sans</Code>); the Lightning theme swaps in Inter.</>,
            <><strong>Mono</strong> (<Code>--font-mono</Code>) is for ids, paths, keys and code: <Text mono>project_credential_id</Text>. Use <Code>Code</Code> for a bit of code inside a sentence, and <Code>CodeBlock</Code> for a block.</>,
          ]}
        />
      </Section>

      <Section title="Rules">
        <DoDont
          doExample={
            <Stack gap="xs">
              <Text tone="strong">Nightly sync</Text>
              <Text tone="muted" size="xs">
                Last run 2 hours ago
              </Text>
            </Stack>
          }
          doText="Use Text's tones and sizes, so every row reads the same."
          dontExample={<Text tone="muted">&lt;span className="text-[13px] text-slate-500"&gt;</Text>}
          dontText="Picking a size or colour by hand drifts from the rest of the app and ignores the theme."
        />
      </Section>
    </DocPage>
  );
}
