import Callout from "../../components/primitives/Callout";
import { Bullets, DocPage, P, Section } from "../parts/Doc";

/** What the system is for, and the principles behind it. */
export default function Introduction() {
  return (
    <DocPage
      eyebrow="Getting started"
      title="Introduction"
      lead="OpenFn is used by health ministries, NGOs and governments to move data between the systems they depend on. The people using it are busy, often not developers, and sometimes on a slow connection. The design system exists so that every screen they meet behaves the way the last one did."
    >
      <Section title="A product that feels like one product">
        <P>
          When pages share the same parts, people learn the product once. A list of credentials works like a list of
          channels; a form that's missing a field says so the same way everywhere; a menu closes when you click outside it,
          wherever it is. That familiarity is what lets people focus on their integration instead of on our interface.
        </P>
        <P>
          It helps us too. A change to how a button looks is a change to one file. A new screen is mostly a page made of
          parts that already exist. And because pages only draw, the same page can be fed by fixtures in Storybook, by the
          API in the app, or by a LiveView island inside today's Lightning.
        </P>
      </Section>

      <Section title="Principles">
        <Bullets
          items={[
            <>
              <strong>Speak like a person.</strong> Sentence case, plain words, and say what happened or what to do next.
              "Enter a project name", not "Validation error".
            </>,
            <>
              <strong>Never leave someone guessing.</strong> If a form isn't ready, say what's missing beside the field,
              don't grey out the button. If something is saving, say "Saving…". If the server refused, show its reason.
            </>,
            <>
              <strong>Accessible from the start.</strong> Accessibility lives in primitives, so every screen built from them
              gets focus, labels and keyboard support without thinking about it. Retrofitting it later is far harder.
            </>,
            <>
              <strong>Quiet by default.</strong> Colour carries meaning (danger, success, the thing you're working in), so
              most of the interface is grey and white. Badges are muted; red is for things that really went wrong.
            </>,
            <>
              <strong>Works on any screen.</strong> Layouts stack on a phone and the sidebar becomes a drawer. People check
              on a failed run from wherever they are.
            </>,
            <>
              <strong>One way to do each thing.</strong> If there's a component for it, use it. If one is close, extend it
              with a prop. Two components that do the same job is how a design system falls apart.
            </>,
          ]}
        />
      </Section>

      <Section title="Where it comes from">
        <P>
          The system grew out of the redesign of Lightning, OpenFn's workflow platform, and is shaped by Lightning's API and
          its existing screens. Themes let the same components wear today's Lightning look, the redesign, or a government
          design system such as GOV.UK's, without changing a line of component code.
        </P>
        <Callout title="This is a living system">
          Components get added and changed every week. When something here doesn't match the code, the code wins, and
          the component reference is read from the code so that part can't drift at all.
        </Callout>
      </Section>
    </DocPage>
  );
}
