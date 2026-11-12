import CodeBlock from "../../components/primitives/CodeBlock";
import Code from "../../components/primitives/Code";
import DataTable from "../../components/primitives/DataTable";
import Text from "../../components/primitives/Text";
import TextLink from "../../components/primitives/TextLink";
import { Bullets, DocPage, P, Section, SubHeading } from "../parts/Doc";

const commands = [
  { cmd: "npm run dev", what: "The app, with the fake API answering from fixtures." },
  { cmd: "npm run storybook", what: "Storybook on port 6006: every component and page in every state." },
  { cmd: "npm test", what: "Vitest. Pages and their wrappers in jsdom, the fake server's rules in Node." },
  { cmd: "npm run lint", what: "ESLint, including the layer rules: which folder may import which." },
  { cmd: "npm run metrics", what: "The ratchet: styling outside primitives, components without stories, debt." },
  { cmd: "npm run build", what: "Typecheck and build. CI also builds Storybook." },
];

const folders = [
  { path: "src/components/primitives/", what: "The smallest pieces: Button, Card, Text, Stack, Modal. No OpenFn words." },
  { path: "src/components/patterns/", what: "The shape of a screen or a region: PageHeader, ListPage, SettingsLayout." },
  { path: "src/components/domain/", what: "Anything in OpenFn's words: StatusPill, WorkflowCanvas, Sidebar." },
  { path: "src/pages/<page>/", what: "One folder per screen: the page, its wrapper, story and tests." },
  { path: "src/model/", what: "Types, fixed vocabulary and pure functions every layer can use." },
  { path: "src/theme/", what: "The colour, type and radius tokens, and the themes that re-skin them." },
  { path: "src/api/, src/fake-api/", what: "The API client and hooks, and the pretend server that answers them." },
];

/** Set up, find your way around, and build something. */
export default function GettingStarted() {
  return (
    <DocPage
      eyebrow="Getting started"
      title="Getting started"
      lead="Everything you need to run the app, find the right component and add one of your own."
    >
      <Section title="Run it">
        <P>The app is React and TypeScript on Vite, styled with Tailwind. Clone the repo, then:</P>
        <CodeBlock tone="light" code={"npm install\nnpm run dev        # the app\nnpm run storybook  # the component catalogue"} />
        <DataTable
          rows={commands}
          getRowKey={(r) => r.cmd}
          columns={[
            { key: "cmd", header: "Command", render: (r) => <Code>{r.cmd}</Code> },
            { key: "what", header: "What it does", render: (r) => <Text>{r.what}</Text> },
          ]}
        />
      </Section>

      <Section title="Find your way around">
        <DataTable
          rows={folders}
          getRowKey={(r) => r.path}
          columns={[
            { key: "path", header: "Folder", render: (r) => <Code>{r.path}</Code> },
            { key: "what", header: "What's in it", render: (r) => <Text>{r.what}</Text> },
          ]}
        />
        <P>
          The longer guide is <Code>docs/architecture.md</Code> in the repo. These pages cover the same ground for the
          design system and add live examples.
        </P>
      </Section>

      <Section title="Use a component">
        <P>
          Components are default exports, imported by path. A page builds its screen from them and passes its data down
          as props:
        </P>
        <CodeBlock
          tone="light"
          code={`import PageHeader from "../../components/patterns/PageHeader";
import Button from "../../components/primitives/Button";
import Stack from "../../components/primitives/Stack";
import EmptyState from "../../components/primitives/EmptyState";

export default function CredentialsPage({ data, onNew }: CredentialsPageProps) {
  return (
    <Stack gap="lg">
      <PageHeader
        title="Credentials"
        actions={<Button onClick={onNew}>New credential</Button>}
      />
      {data.credentials.length === 0 && <EmptyState title="No credentials yet." />}
    </Stack>
  );
}`}
        />
        <P>
          Lay things out with <TextLink to="/docs/components/Stack" variant="inline">Stack</TextLink>,{" "}
          <TextLink to="/docs/components/Inline" variant="inline">Inline</TextLink> and{" "}
          <TextLink to="/docs/components/Grid" variant="inline">Grid</TextLink>, and write words with{" "}
          <TextLink to="/docs/components/Text" variant="inline">Text</TextLink>. You shouldn't need a <Code>className</Code>{" "}
          in a page or a domain component; if you do, a primitive is missing.
        </P>
      </Section>

      <Section title="Your first component">
        <P>When nothing in the library fits, add a component before you use it.</P>
        <Bullets
          ordered
          items={[
            <>
              <strong>Look first.</strong> Search <TextLink to="/docs/components" variant="inline">Components</TextLink>. If
              one is close, add a prop or a variant to it instead of copying it.
            </>,
            <>
              <strong>Pick the layer</strong> by what it knows: nothing about OpenFn and small, a primitive; the shape of a
              region, a pattern; any OpenFn noun, domain.{" "}
              <TextLink to="/docs/core-concepts#which-layer" variant="inline">Which layer?</TextLink>
            </>,
            <>
              <strong>Write its props by hand,</strong> with a comment over every prop. Those comments are what the
              component reference on this site shows.
            </>,
            <>
              <strong>Add a story</strong> beside it (<Code>Button.stories.tsx</Code>), titled by its layer and name (
              <Code>Primitives/Button</Code>), with a default story and each meaningful variant.
            </>,
            <>
              <strong>Check it:</strong> <Code>npm run lint</Code>, <Code>npm run metrics:check</Code> and{" "}
              <Code>npm run build-storybook</Code>.
            </>,
          ]}
        />
        <SubHeading>A minimal primitive</SubHeading>
        <CodeBlock
          tone="light"
          code={`import type { ReactNode } from "react";

interface Props {
  /** What the hint is about, read out first. */
  title: string;
  /** \`subtle\` for a hint in a dense card. */
  tone?: "default" | "subtle";
  children?: ReactNode;
}

/** A short hint beside a control, saying what it does. */
export default function Hint({ title, tone = "default", children }: Props) {
  return (
    <p className={tone === "subtle" ? "text-xs text-gray-400" : "text-sm text-gray-500"}>
      <span className="font-medium">{title}</span> {children}
    </p>
  );
}`}
        />
        <P>
          Only primitives style themselves with <Code>className</Code>, and only with Tailwind utilities that resolve to
          theme tokens, never a hex value. <TextLink to="/docs/foundations/colour" variant="inline">Colour</TextLink> says why.
        </P>
      </Section>
    </DocPage>
  );
}
