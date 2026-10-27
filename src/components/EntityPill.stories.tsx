import type { Meta, StoryObj } from "@storybook/react";
import { X, Zap } from "lucide-react";
import EntityPill from "./EntityPill";
import IconButton from "./IconButton";
import { TriggerIcon } from "./workflow/AdaptorIcon";
import { withRouter } from "../stories/decorators";
import { connectedSystemSummaries, recommendedSystems } from "../mock-data/connected-systems";
import { adaptorChoices, adaptorInfo } from "../mock-data/adaptor-reference";
import { triggerTypes } from "../mock-data/workflow";

const meta: Meta<typeof EntityPill> = {
  title: "Components/EntityPill",
  component: EntityPill,
  decorators: [withRouter],
  args: { name: "DHIS2", adaptor: "dhis2" },
};

export default meta;
type Story = StoryObj<typeof EntityPill>;

export const Default: Story = {};

/** A connected system links to its page. */
export const Connected: Story = {
  args: { to: "/connected-systems/dhis2" },
};

/** A system that isn't connected yet starts the add flow. */
export const Suggested: Story = {
  args: { name: "OpenMRS", adaptor: "openmrs", tone: "suggested", title: "Electronic medical records", onClick: () => {} },
};

/** Static label, as on idea and suggestion cards. */
export const Small: Story = {
  args: { name: "Google Sheets", adaptor: undefined, size: "sm" },
};

/** A step's adaptor with its pinned version, as in the step inspector. */
export const Adaptor: Story = {
  args: { name: adaptorInfo.http.name, adaptor: "http", suffix: adaptorInfo.http.version, size: "sm" },
};

/** As a button, as in the code pane header where it opens the step's config. */
export const AdaptorButton: Story = {
  args: { name: adaptorInfo.http.name, adaptor: "http", suffix: adaptorInfo.http.version, size: "xs", onClick: () => {} },
};

/** A custom glyph in place of the logo, as for a trigger on the canvas. */
export const Trigger: Story = {
  args: {
    name: triggerTypes.webhook.label,
    adaptor: undefined,
    size: "sm",
    icon: <TriggerIcon triggerType="webhook" size="xs" />,
  },
};

/** What a message to the assistant is about, with an X while it's still in the chat input. */
export const Reference: Story = {
  args: {
    name: "Search for duplicate citizens in Identity",
    adaptor: "http",
    shape: "tag",
    size: "sm",
    tone: "accent",
    trailing: <IconButton size="2xs" icon={X} label="Remove" onClick={() => {}} />,
  },
};

export const TriggerReference: Story = {
  args: {
    name: "Webhook trigger",
    adaptor: undefined,
    icon: <Zap size={12} className="text-indigo-500" />,
    shape: "tag",
    size: "sm",
    tone: "accent",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <EntityPill name="HTTP" adaptor="http" size="xs" />
      <EntityPill name="HTTP" adaptor="http" size="sm" />
      <EntityPill name="HTTP" adaptor="http" size="md" />
    </div>
  ),
};

export const Systems: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {connectedSystemSummaries.map((s) => (
        <EntityPill key={s.id} name={s.name} adaptor={s.adaptor} to={`/connected-systems/${s.id}`} />
      ))}
      {recommendedSystems.map((s) => (
        <EntityPill key={s.name} name={s.name} adaptor={s.adaptor} tone="suggested" title={s.description} onClick={() => {}} />
      ))}
    </div>
  ),
};

export const Adaptors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {adaptorChoices.map((a) => (
        <EntityPill key={a} name={adaptorInfo[a].name} adaptor={a} suffix={adaptorInfo[a].version} size="sm" />
      ))}
    </div>
  ),
};
