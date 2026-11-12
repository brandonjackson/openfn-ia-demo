import { BookOpen, Boxes, Compass, Layers, Palette, Rocket } from "lucide-react";
import catalog from "virtual:component-catalog";
import Code from "../../components/primitives/Code";
import Card from "../../components/primitives/Card";
import Grid from "../../components/primitives/Grid";
import IconTile from "../../components/primitives/IconTile";
import Inline from "../../components/primitives/Inline";
import Stack from "../../components/primitives/Stack";
import StatTile from "../../components/primitives/StatTile";
import Text from "../../components/primitives/Text";
import TextLink from "../../components/primitives/TextLink";
import { Bullets, DocPage, P, Section } from "../parts/Doc";
import { storybookUrl } from "../links";

const sections = [
  {
    to: "/docs/getting-started",
    icon: Rocket,
    title: "Getting started",
    text: "Run the app and Storybook, find your way around the repo and ship your first component.",
  },
  {
    to: "/docs/core-concepts",
    icon: Layers,
    title: "Core concepts",
    text: "The four layers, slots, and why pages draw and nothing else.",
  },
  {
    to: "/docs/foundations/colour",
    icon: Palette,
    title: "Foundations",
    text: "Colour, type, layout, icons and the words we use: the parts every screen is made of.",
  },
  {
    to: "/docs/guidelines/forms",
    icon: Compass,
    title: "Guidelines",
    text: "How forms, lists, saving, menus and empty states behave, the same way everywhere.",
  },
  {
    to: "/docs/components",
    icon: Boxes,
    title: "Components",
    text: "Every component in the library, with its props read straight from the source.",
  },
  {
    href: storybookUrl,
    icon: BookOpen,
    title: "Storybook",
    text: "Every component and page in every state, to click through and try under each theme.",
  },
];

/** The front door: what the system is, and where to go next. */
export default function Overview() {
  const count = (layer: string) => catalog.filter((c) => c.layer === layer).length;
  return (
    <DocPage
      eyebrow="OpenFn design system"
      title="Build OpenFn from one set of parts"
      lead={
        <>
          The design system is the components, rules and guidance behind every screen in OpenFn. It gives us one way to
          draw a button, a list or a form, so people can learn the product once and we can change it in one place.
        </>
      }
    >
      <Grid columns={3}>
        {sections.map((s) => (
          <Card key={s.title} to={s.to} padding="sm" onClick={s.href ? () => window.open(s.href, "_blank", "noopener") : undefined}>
            <Stack gap="sm">
              <IconTile icon={s.icon} tone="indigo" size="sm" />
              <Text tone="strong">{s.title}</Text>
              <Text tone="muted">{s.text}</Text>
            </Stack>
          </Card>
        ))}
      </Grid>

      <Section title="What's in it">
        <Grid columns={4}>
          <StatTile label="Primitives" value={count("primitives")} />
          <StatTile label="Patterns" value={count("patterns")} />
          <StatTile label="Domain components" value={count("domain")} />
          <StatTile label="Themes" value={3} />
        </Grid>
        <P>
          Everything on screen is a component, and every component lives in one of three layers, by what it knows.{" "}
          <strong>Primitives</strong> are the smallest pieces and know nothing about OpenFn. <strong>Patterns</strong> are
          the shape of a screen or a region of one. <strong>Domain components</strong> speak OpenFn: runs, workflows,
          credentials, X-Road. Pages put them together. <TextLink to="/docs/core-concepts" variant="inline">Core concepts</TextLink>{" "}
          walks through how they fit.
        </P>
      </Section>

      <Section title="Who it's for">
        <Bullets
          items={[
            <>
              <strong>Developers</strong> building a screen: start with{" "}
              <TextLink to="/docs/getting-started" variant="inline">Getting started</TextLink>, then reach for{" "}
              <TextLink to="/docs/components" variant="inline">Components</TextLink> as you go.
            </>,
            <>
              <strong>Designers</strong> deciding how something should look and behave: the{" "}
              <TextLink to="/docs/foundations/colour" variant="inline">Foundations</TextLink> and{" "}
              <TextLink to="/docs/guidelines/forms" variant="inline">Guidelines</TextLink> are the rules we hold the app to.
            </>,
            <>
              <strong>Agents</strong> working in the repo read the same rules from <Code>CLAUDE.md</Code> and{" "}
              <Code>docs/architecture.md</Code>; these pages are the friendlier way in.
            </>,
          ]}
        />
      </Section>

      <Section title="How it stays tidy">
        <P>
          Rules nobody checks drift. So the important ones are checked by the build, not in review: lint stops a
          component importing from the wrong layer, and the ratchet (<Code>npm run metrics</Code>) fails CI if styling
          creeps out of primitives or a component turns up without a story. This site reads its component reference from
          the source too, so it can't fall out of date.
        </P>
        <Inline gap="lg" wrap>
          <TextLink to="/docs/contributing" variant="action">How to contribute</TextLink>
          <TextLink href={storybookUrl} variant="action">Open Storybook</TextLink>
        </Inline>
      </Section>
    </DocPage>
  );
}
