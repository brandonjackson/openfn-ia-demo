import Badge from "../../../components/primitives/Badge";
import Button from "../../../components/primitives/Button";
import Card from "../../../components/primitives/Card";
import Code from "../../../components/primitives/Code";
import DataTable from "../../../components/primitives/DataTable";
import Grid from "../../../components/primitives/Grid";
import Inline from "../../../components/primitives/Inline";
import SearchInput from "../../../components/primitives/SearchInput";
import Stack from "../../../components/primitives/Stack";
import Text from "../../../components/primitives/Text";
import TextLink from "../../../components/primitives/TextLink";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { DoDont, Example } from "../../parts/Example";

const gaps = [
  { gap: "none", px: "0", use: "Pieces that touch" },
  { gap: "xs", px: "4px", use: "A label and its value, an icon and its text" },
  { gap: "sm", px: "8px", use: "Buttons in a group, badges after a name (Inline's default)" },
  { gap: "md", px: "16px", use: "Things in a card or a form (Stack's default)" },
  { gap: "lg", px: "24px", use: "Sections of a page" },
  { gap: "xl", px: "32px", use: "Groups of a list" },
];

const box = (label: string) => (
  <Card padding="sm">
    <Text tone="muted" size="xs">
      {label}
    </Text>
  </Card>
);

/** Stack, Inline and Grid, the spacing scale, and the page column. */
export default function Layout() {
  return (
    <DocPage
      eyebrow="Foundations"
      title="Layout and spacing"
      lead="Pages and domain components lay themselves out with three primitives and one spacing scale, so there's no styling of their own to drift."
    >
      <Section title="The layout kit">
        <P>
          <TextLink to="/docs/components/Stack" variant="inline">Stack</TextLink> puts children one above the other,{" "}
          <TextLink to="/docs/components/Inline" variant="inline">Inline</TextLink> side by side, and{" "}
          <TextLink to="/docs/components/Grid" variant="inline">Grid</TextLink> in even columns that fold up on a phone.
          Between them they cover almost every layout in the app.
        </P>
        <Example
          column
          code={`<Stack gap="sm">
  <Inline justify="between">
    <Text tone="strong">Members</Text>
    <Button size="sm" variant="secondary">Invite</Button>
  </Inline>
  <Grid columns={3} gap="sm">…</Grid>
</Stack>`}
        >
          <Stack gap="sm">
            <Inline justify="between">
              <Text tone="strong">Members</Text>
              <Button size="sm" variant="secondary">
                Invite
              </Button>
            </Inline>
            <Grid columns={3} gap="sm">
              {box("Owner")}
              {box("Admin")}
              {box("Editor")}
            </Grid>
          </Stack>
        </Example>
      </Section>

      <Section title="Spacing scale">
        <P>Every gap is one of six steps. Pick by the relationship, not the pixels.</P>
        <DataTable
          rows={gaps}
          getRowKey={(r) => r.gap}
          columns={[
            { key: "gap", header: "gap", render: (r) => <Code>{r.gap}</Code> },
            { key: "px", header: "Size", render: (r) => <Text tone="muted">{r.px}</Text> },
            {
              key: "sample",
              header: "Looks like",
              render: (r) => (
                <Inline gap={r.gap as "none"}>
                  <Badge label="A" tone="indigo" />
                  <Badge label="B" tone="indigo" />
                  <Badge label="C" tone="indigo" />
                </Inline>
              ),
            },
            { key: "use", header: "For", render: (r) => <Text>{r.use}</Text> },
          ]}
        />
      </Section>

      <Section title="Responsive">
        <P>
          Layouts work at phone width. <Code>Grid</Code> drops to one column under the <Code>sm</Code> breakpoint, and{" "}
          <Code>Inline stackOnMobile</Code> puts a row's children one above the other on a phone. <Code>Inline wrap</Code> lets
          a row of chips flow onto more lines, and <Code>grow</Code> lets a search take the free width beside its filters.
        </P>
        <Example
          code={`<Inline stackOnMobile>
  <Stack grow><SearchInput placeholder="Search workflows" /></Stack>
  <Button variant="secondary">Filter</Button>
</Inline>`}
          column
        >
          <Inline stackOnMobile>
            <Stack grow>
              <SearchInput placeholder="Search workflows" />
            </Stack>
            <Button variant="secondary">Filter</Button>
          </Inline>
        </Example>
      </Section>

      <Section title="The page">
        <Bullets
          items={[
            <>Every page outside the editor sits in <Code>PageContainer</Code>, a centred column capped at 1024px. <Code>Layout</Code> adds it, so pages never set their own width.</>,
            <>Pages start with <Code>PageHeader</Code>. Lists use <Code>ListPage</Code>, settings use <Code>SettingsLayout</Code>.</>,
            <>The workflow editor is laid out like an IDE, by <Code>EditorShell</Code>, <Code>CanvasLayout</Code> and <Code>CodeLayout</Code>.</>,
          ]}
        />
      </Section>

      <Section title="Rules">
        <DoDont
          doExample={<Text mono size="xs">{`<Inline gap="sm">…</Inline>`}</Text>}
          doText="Lay out with Stack, Inline and Grid in pages and domain components."
          dontExample={<Text mono size="xs">{`<div className="flex gap-2">…</div>`}</Text>}
          dontText="The ratchet won't let className grow outside primitives. If a layout primitive can't do it, add a prop to one."
        />
      </Section>
    </DocPage>
  );
}
