import Callout from "../../components/primitives/Callout";
import Code from "../../components/primitives/Code";
import DataTable from "../../components/primitives/DataTable";
import Text from "../../components/primitives/Text";
import TextLink from "../../components/primitives/TextLink";
import { Bullets, DocPage, P, Section } from "../parts/Doc";

const checks = [
  { what: "Layer imports", how: "npm run lint", why: "A component importing from a higher layer, or a page reading fixtures, the API or the router." },
  { what: "className outside primitives", how: "npm run metrics:check", why: "Counted per layer; the count can only go down." },
  { what: "Raw controls in pages", how: "npm run metrics:check", why: "A hand-rolled <button>, <input>, <select>, <textarea> or <table> in a page." },
  { what: "Components without stories", how: "npm run metrics:check", why: "Every component and page has a story beside it." },
  { what: "Story titles", how: "npm run metrics:check", why: "A story's title is its layer and its name, e.g. Primitives/Button." },
  { what: "Stories compile", how: "npm run build-storybook", why: "Runs in CI on every pull request." },
];

/** How to add to the system and keep it tidy. */
export default function Contributing() {
  return (
    <DocPage
      eyebrow="Getting started"
      title="Contributing"
      lead="The system grows a component at a time, as screens need them. These are the habits that keep it one system rather than many."
    >
      <Section title="Extend before you add">
        <P>
          Two components that do the same job is how a design system falls apart. Before writing one, search{" "}
          <TextLink to="/docs/components" variant="inline">Components</TextLink>. If something is close, give it a prop or a
          variant: <Code>Card</Code> gained <Code>to</Code> to become a link, <Code>Badge</Code> gained{" "}
          <Code>shape="tag"</Code> for the small note beside a name. Reach for the core primitives first: <Code>NavItem</Code>{" "}
          for any row of places or choices, <Code>Card</Code> for a bordered box, <Code>IconTile</Code> for a glyph on a square,{" "}
          <Code>Badge</Code> for a small label, <Code>FormField</Code> for a field.
        </P>
      </Section>

      <Section title="Adding a component">
        <Bullets
          ordered
          items={[
            <>Put it in the layer that fits what it knows (<TextLink to="/docs/core-concepts#which-layer" variant="inline">Which layer?</TextLink>).</>,
            <>Write the props type by hand, with a comment over each prop, and a JSDoc comment over the function saying what it's for and where it's used. This site shows both.</>,
            <>Keep rules out of it: who can do what arrives as a prop or an <Code>onX</Code> callback, and leaving one out hides the control.</>,
            <>Add <Code>Name.stories.tsx</Code> beside it, titled <Code>Layer/Name</Code>, with a default story and each meaningful variant. Use fixtures from <Code>src/fixtures/</Code> rather than inventing data.</>,
            <>Changed a component's props? Update its stories. Deleted one? Delete its stories too.</>,
            <>Run <Code>npm run lint</Code>, <Code>npm test</Code>, <Code>npm run metrics:check</Code> and <Code>npm run build-storybook</Code>.</>,
          ]}
        />
      </Section>

      <Section title="What the build checks">
        <DataTable
          rows={checks}
          getRowKey={(r) => r.what}
          columns={[
            { key: "what", header: "Check", render: (r) => <Text tone="strong">{r.what}</Text> },
            { key: "how", header: "Run", render: (r) => <Code>{r.how}</Code> },
            { key: "why", header: "Catches", render: (r) => <Text>{r.why}</Text> },
          ]}
        />
        <P>
          The ratchet is <Code>scripts/metrics.mjs</Code>. When you lower a count, run <Code>npm run metrics:update</Code> and
          commit the new baseline in <Code>metrics.json</Code>. The numbers only go down, so the system gets tidier without
          anyone arguing about it in review.
        </P>
      </Section>

      <Section title="Debt">
        <P>
          When old code breaks a new rule and can't be fixed right away, it gets an <Code>eslint-disable</Code> comment that
          starts with <Code>debt:</Code> and says what would fix it. New work never adds one, and lint is never silenced
          any other way.
        </P>
        <Callout variant="warning" title="Don't silence the rules">
          A lint message about layers says why the rule exists and what to do instead. If it seems wrong for your case, the
          component is usually in the wrong layer, or a pattern needs a slot.
        </Callout>
      </Section>
    </DocPage>
  );
}
