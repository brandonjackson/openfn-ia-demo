import { useState } from "react";
import { Box, Boxes, LayoutTemplate, Plus, Workflow } from "lucide-react";
import ListPage from "../../components/patterns/ListPage";
import PageHeader from "../../components/patterns/PageHeader";
import Button from "../../components/primitives/Button";
import Callout from "../../components/primitives/Callout";
import Card from "../../components/primitives/Card";
import Code from "../../components/primitives/Code";
import CodeBlock from "../../components/primitives/CodeBlock";
import DataTable from "../../components/primitives/DataTable";
import Grid from "../../components/primitives/Grid";
import IconTile from "../../components/primitives/IconTile";
import ListGroup from "../../components/primitives/ListGroup";
import ListRow from "../../components/primitives/ListRow";
import SegmentedControl from "../../components/primitives/SegmentedControl";
import Stack from "../../components/primitives/Stack";
import Text from "../../components/primitives/Text";
import TextLink from "../../components/primitives/TextLink";
import StatusPill from "../../components/domain/StatusPill";
import { Bullets, DocPage, P, Section, SubHeading } from "../parts/Doc";
import { Example } from "../parts/Example";

const layers = [
  {
    icon: Box,
    name: "Primitives",
    folder: "components/primitives/",
    knows: "Nothing about OpenFn. Where accessibility and the look live.",
    examples: "Button, Card, Text, Stack, NavItem, Modal",
    imports: "primitives; types from model",
  },
  {
    icon: LayoutTemplate,
    name: "Patterns",
    folder: "components/patterns/",
    knows: "The shape of a screen or a region. No OpenFn nouns; content comes in through slots.",
    examples: "PageHeader, ListPage, SettingsLayout, EditorShell",
    imports: "primitives, patterns",
  },
  {
    icon: Workflow,
    name: "Domain",
    folder: "components/domain/",
    knows: "OpenFn's words, from a status up to the workflow canvas. Meaning, not rules.",
    examples: "StatusPill, EntityPill, Sidebar, WorkflowCanvas",
    imports: "primitives, domain, model",
  },
  {
    icon: Boxes,
    name: "Pages",
    folder: "pages/<page>/",
    knows: "One screen. Takes everything as props and draws, nothing else.",
    examples: "ProjectsPage, HistoryPage, WorkflowEditorPage",
    imports: "any component, model",
  },
];

const liveView = [
  { lv: "mount and handle_params load the assigns", here: "the wrapper reads the route and fetches data" },
  { lv: "assigns", here: "the page's props" },
  { lv: "phx-click / pushEvent", here: "an onX callback" },
  { lv: "handle_event changes state, then the view re-renders", here: "the wrapper saves, then the page redraws from fresh props" },
  { lv: "a function component", here: "a domain component or a pattern" },
];

/** The four layers, slots, and the seam between pages and data. */
export default function CoreConcepts() {
  const [view, setView] = useState("All");
  return (
    <DocPage
      eyebrow="Getting started"
      title="Core concepts"
      lead="Everything on screen belongs to one of four layers, and each layer only imports from the ones below it. Most of the rest of the system follows from that one idea."
    >
      <Section id="layers" title="The layers">
        <P>
          Primitives are the base. Patterns and domain components both sit on them, side by side, and never import each
          other. Pages sit on top, and are where a pattern and the domain components that fill it meet.
        </P>
        <Grid columns={4} gap="sm">
          {layers.map((l) => (
            <Card key={l.name} padding="sm">
              <Stack gap="sm">
                <IconTile icon={l.icon} size="sm" tone="indigo" />
                <Text tone="strong">{l.name}</Text>
                <Text tone="muted" size="xs" mono>
                  {l.folder}
                </Text>
                <Text size="xs">{l.knows}</Text>
                <Text size="xs" tone="muted">
                  May import: {l.imports}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
        <CodeBlock
          tone="light"
          code={`             ┌─ patterns ─┐
primitives ──┤            ├── pages
             └─ domain  ──┘`}
        />
        <P>
          Why bother? Codebases go bad the same way: fetching, rules, styling and layout end up tangled in the same
          components, so you can't change the API without touching hundreds of files or change a button without breaking a
          page. With layers, each kind of change has one home. A new look is a change to primitives. A new data source is a
          change to wrappers. A new screen is a page made of parts that already exist. Lint enforces the imports, so a wrong
          one fails <Code>npm run lint</Code> with a message that says why.
        </P>
      </Section>

      <Section id="which-layer" title="Which layer?">
        <P>Ask what the component knows.</P>
        <Bullets
          items={[
            <>Knows nothing about OpenFn and is one small piece: a <strong>primitive</strong>.</>,
            <>Is the shape of a screen or a region, and could drop into another product unchanged: a <strong>pattern</strong>.</>,
            <>Knows any OpenFn noun (a run, a workflow, a credential, X-Road, the sidebar's menu): <strong>domain</strong>, however big it is.</>,
          ]}
        />
        <P>If you find yourself needing something from a higher layer, the component is probably in the wrong one.</P>
      </Section>

      <Section id="slots" title="Patterns take OpenFn content through slots">
        <P>
          A pattern stays reusable only if it doesn't know OpenFn's nouns. So it takes content as <Code>children</Code> or{" "}
          <Code>ReactNode</Code> props, and whoever uses it passes the domain components in. Here's a real{" "}
          <TextLink to="/docs/components/ListPage" variant="inline">ListPage</TextLink>: it decides the order (header,
          toolbar, list), but has no idea it's showing workflows.
        </P>
        <Example
          backdrop
          column
          code={`<ListPage
  header={<PageHeader title="Workflows" actions={<Button icon={Plus}>New workflow</Button>} />}
  toolbar={<SegmentedControl options={["All", "Failing"]} value={view} onChange={setView} />}
>
  <ListGroup title="Active" count={2}>
    <ListRow icon={Workflow} title="Patient intake" trailing={<StatusPill status="success" />} />
    <ListRow icon={Workflow} title="Nightly sync" trailing={<StatusPill status="failed" />} />
  </ListGroup>
</ListPage>`}
        >
          <ListPage
            header={<PageHeader title="Workflows" actions={<Button icon={Plus}>New workflow</Button>} />}
            toolbar={<SegmentedControl options={["All", "Failing"]} value={view} onChange={setView} />}
          >
            <ListGroup title="Active" count={view === "All" ? 2 : 1}>
              {view === "All" && <ListRow icon={Workflow} title="Patient intake" trailing={<StatusPill status="success" />} />}
              <ListRow icon={Workflow} title="Nightly sync" trailing={<StatusPill status="failed" />} />
            </ListGroup>
          </ListPage>
        </Example>
        <P>
          The same <Code>ListPage</Code> serves Credentials, Channels and Projects. If it imported <Code>StatusPill</Code>{" "}
          itself, it would know about runs and couldn't. That's why patterns can't import <Code>domain/</Code> or{" "}
          <Code>model/</Code>: model's types are OpenFn nouns too.
        </P>
      </Section>

      <Section id="domain" title="Domain draws with primitives">
        <P>
          A domain component is built from primitives and other domain components, never a pattern. When it belongs inside
          a pattern's frame, it hands its pieces to the page and the page fills the pattern's slots. Where the pieces share
          state, the domain component takes a function as its children:
        </P>
        <CodeBlock
          tone="light"
          code={`<CodeWorkspace {...props}>
  {(code) => (
    <CodeLayout nav={code.nav} header={code.header} footer={code.footer}>
      {code.main}
    </CodeLayout>
  )}
</CodeWorkspace>`}
        />
        <SubHeading>Meaning, not rules</SubHeading>
        <P>
          A domain component knows what colour "crashed" is and how a cron string reads. It doesn't decide who can delete or
          what retry does: those arrive as props (<Code>canDelete</Code>, <Code>onRetry</Code>), set by the page's wrapper.
          Leave a callback out and the control isn't drawn.
        </P>
      </Section>

      <Section id="seam" title="Pages draw, and nothing else">
        <P>
          Every page has a folder of its own with the page and a wrapper beside it. The page takes everything as props;
          the wrapper is the only file that knows where data comes from.
        </P>
        <CodeBlock
          tone="light"
          code={`src/pages/projects/ProjectsPage.tsx              draws, and nothing else
src/pages/projects/ProjectsPage.query.tsx        feeds it from the API and the router
src/pages/projects/ProjectsPage.stories.tsx      the page in Storybook, from fixtures
src/pages/projects/ProjectsPage.test.tsx         what the page draws and asks for
src/pages/projects/ProjectsPage.query.test.tsx   the wrapper on the fake server`}
        />
        <SubHeading>Props down, promises up</SubHeading>
        <P>
          Data goes down as props. An action that reaches a server is a callback that returns a promise, and the page
          redraws from the props it gets back: the server is the truth. Navigation isn't a server action, so it's a plain
          callback.
        </P>
        <CodeBlock
          tone="light"
          code={`export interface ProjectsPageProps extends PageProps<ProjectsPageData> {
  /** Makes a project. Refused with a 422 naming the field when the name is taken. */
  onCreateProject: (name: string) => Promise<void>;
  /** Opens a project. */
  onOpenProject: (id: string) => void;
}`}
        />
        <P>
          UI state stays in the page: which tab is open, a dropdown, a form you haven't saved yet. Only things a server
          would hold go through the seam. That's what lets the same page run on fixtures in Storybook, on the API in the
          app, and one day inside a LiveView island.
        </P>
        <SubHeading>For people who know LiveView</SubHeading>
        <DataTable
          rows={liveView}
          getRowKey={(r) => r.lv}
          columns={[
            { key: "lv", header: "LiveView", render: (r) => <Text>{r.lv}</Text> },
            { key: "here", header: "Here", render: (r) => <Text>{r.here}</Text> },
          ]}
        />
      </Section>

      <Section id="flags" title="Feature flags">
        <P>
          The app shows a redesign of today's Lightning with new features on top. Anything beyond Lightning sits behind a
          flag in <Code>src/model/feature-flags.ts</Code>. Only wrappers, the shell and the route table read flags: a
          wrapper leaves out the data or callback for what's off, and the page draws nothing for what it isn't given. Where
          something always rendered, it gets an optional prop instead, with a story for the off state.
        </P>
        <Callout title="Check both presets">
          Everything on (the full vision), and everything off, the Lightning redesign (<Code>?flags=redesign</Code>).
        </Callout>
      </Section>
    </DocPage>
  );
}
