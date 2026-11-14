import { useState } from "react";
import Button from "../../../components/primitives/Button";
import Code from "../../../components/primitives/Code";
import CodeBlock from "../../../components/primitives/CodeBlock";
import Inline from "../../../components/primitives/Inline";
import { ToastStack } from "../../../components/primitives/Toast";
import type { ToastItem, ToastTone } from "../../../components/primitives/Toast";
import { Bullets, DocPage, P, Section } from "../../parts/Doc";
import { Example } from "../../parts/Example";

const samples: Record<ToastTone, Omit<ToastItem, "id" | "tone">> = {
  success: { message: "Created intake-v2 from main." },
  error: { message: "dedup wasn't deleted", detail: "Only the sandbox's owner can delete it." },
  info: { message: "Export started.", detail: "Download it from the project's settings once it's ready." },
};

/** How the app says what an action just did. */
export default function Notifications() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = (tone: ToastTone) => setToasts((ts) => [...ts, { id: `${tone}-${Date.now()}`, tone, ...samples[tone] }]);

  return (
    <DocPage
      eyebrow="Guidelines"
      title="Notifications"
      lead="When someone does something, the app says how it went once, in a toast in the corner: it was made, it was saved, or the server said no and why. The page itself stays as it was."
    >
      <Section title="Try it">
        <Example>
          <Inline gap="sm" wrap>
            <Button size="sm" variant="secondary" onClick={() => add("success")}>
              Success
            </Button>
            <Button size="sm" variant="secondary" onClick={() => add("error")}>
              Error
            </Button>
            <Button size="sm" variant="secondary" onClick={() => add("info")}>
              Note
            </Button>
          </Inline>
          <ToastStack toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />
        </Example>
      </Section>

      <Section title="Announce from the wrapper">
        <P>
          Pages only draw, so they never announce anything. A page's wrapper (or <Code>src/app/</Code>) does, once the
          server has answered. For most actions, wrap the promise you hand the page in <Code>useAnnounceOutcome</Code>: it
          says the success, or the failure with the server's reason under it, and hands the promise back so the page can
          still show it pending.
        </P>
        <CodeBlock
          code={`const announcing = useAnnounceOutcome();

<ProjectSandboxesPage
  onDeleteSandbox={(name) =>
    announcing(saves.remove(idOf(name)), {
      success: \`Deleted \${name}.\`,
      failure: \`\${name} wasn't deleted\`,
    })
  }
/>`}
        />
        <P>
          For anything else, <Code>useAnnounce()</Code> gives <Code>{'announce({ tone: "success" | "error" | "info", message, detail })'}</Code>.
          Both come from <Code>src/app/announce.ts</Code>; <Code>AnnouncementsProvider</Code> (<Code>src/app/announcements.tsx</Code>) wraps the app once and
          draws the <Code>ToastStack</Code>.
        </P>
      </Section>

      <Section title="Rules">
        <Bullets
          items={[
            <>A toast is for the outcome of an action. Never put a "what just happened" banner in the page.</>,
            <>A form's problems stay under their fields (<Code>FormField</Code>'s <Code>error</Code>), so a form's wrapper announces only success and leaves <Code>failure</Code> out.</>,
            <>Successes and notes go by themselves after a few seconds, paused while the pointer or focus is on them. Errors stay until they're closed.</>,
            <>Every toast has an X. They stack in the bottom-right corner, at most four, and the same message twice replaces the first.</>,
            <>Successes and notes are read out politely (<Code>role="status"</Code>); errors at once (<Code>role="alert"</Code>).</>,
            <>Write the message as a sentence about what happened ("Deleted dedup."), and a refusal as what didn't happen ("dedup wasn't deleted"), with the server's reason as its detail.</>,
            <>Things that are true of the page, not of an action (a channel that's off, a read-only workflow), stay a <Code>Callout</Code>.</>,
          ]}
        />
      </Section>
    </DocPage>
  );
}
