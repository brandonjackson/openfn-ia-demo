import type { Meta, StoryObj } from "@storybook/react";
import ComponentView from "./ComponentView";
import { projects } from "../../fixtures/projects";
import { componentContent } from "../../fixtures/project-components";
import { isContentComponentType } from "../../model/project-components";

const components = projects.flatMap((p) => p.components).filter((c) => isContentComponentType(c.type));
const content = (id: string) => ({ content: componentContent(components.find((c) => c.id === id)!), updatedAt: "3 days ago", updatedBy: "Brandon Jackson" });

function story(id: string, variant: "pane" | "page" = "pane"): Story {
  const c = components.find((x) => x.id === id)!;
  return { args: { name: c.name, description: c.description, type: c.type as never, content: content(id), variant } };
}

const meta: Meta<typeof ComponentView> = {
  title: "Domain/ComponentView",
  component: ComponentView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 760 }}>
        <Story />
      </div>
    ),
  ],
  args: { onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof ComponentView>;

/** An artifact, as the editor shows it from its explorer: JSON, which won't save until it parses. */
export const Artifact: Story = story("application-field-mapping");

/** A form: its fields, as JSON. */
export const Form: Story = story("planning-submission-form");

/** An AI skill: what it's for and the steps an assistant follows. */
export const AISkill: Story = story("triage-planning-applications");

/** A document, in Markdown. */
export const Document: Story = story("planning-officer-guide");

/** A static website's page, in HTML. */
export const StaticWebsite: Story = story("application-status-site");

/** On the component's page in the project, under the page's own header. */
export const OnPage: Story = { ...story("planning-officer-guide", "page"), parameters: { layout: "padded" } };

/** For someone who can't change it: no Save, and the file reads only. */
export const ReadOnly: Story = { args: { ...story("application-field-mapping").args, onSave: undefined } };

/** A save the server refused. */
export const Refused: Story = {
  args: { ...story("planning-officer-guide").args, onSave: () => Promise.reject(new Error("Someone else changed this component. Reload it and try again.")) },
};
