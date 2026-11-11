import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Inbox, KeyRound, Sparkles, Zap } from "lucide-react";
import ListPage from "./ListPage";
import PageHeader from "./PageHeader";
import FeatureIntro from "./FeatureIntro";
import Button from "../primitives/Button";
import EmptyState from "../primitives/EmptyState";
import ListRow from "../primitives/ListRow";
import SectionHeading from "../primitives/SectionHeading";
import SegmentedControl from "../primitives/SegmentedControl";
import Stack from "../primitives/Stack";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof ListPage> = {
  title: "Patterns/ListPage",
  component: ListPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ListPage>;

const items = [
  { id: "a", title: "Quarterly report", description: "Sent to the board every quarter." },
  { id: "b", title: "Supplier list", description: "Everyone we buy from, and how to reach them." },
  { id: "c", title: "Onboarding checklist", description: "What a new starter needs in their first week." },
];

const header = <PageHeader title="Documents" description="Everything your team has written down." actions={<Button size="sm">New document</Button>} />;

const intro = (
  <FeatureIntro
    title="Why keep documents here?"
    features={[
      { icon: KeyRound, title: "One place", description: "Everyone on the team finds the same version." },
      { icon: Zap, title: "Always current", description: "Edits show up for everyone at once." },
      { icon: Sparkles, title: "Searchable", description: "Find a document by anything in it." },
    ]}
  />
);

const rows = (
  <Stack gap="sm">
    {items.map((item) => (
      <ListRow key={item.id} icon={FileText} title={item.title} description={item.description} />
    ))}
  </Stack>
);

/** The whole shape: header, intro, toolbar, summary and the list. */
export const Default: Story = {
  render: function Render() {
    const [filter, setFilter] = useState("All");
    return (
      <ListPage
        header={header}
        intro={intro}
        toolbar={<SegmentedControl label="Show" options={["All", "Mine", "Shared"]} value={filter} onChange={setFilter} />}
        summary={`${items.length} documents`}
      >
        {rows}
      </ListPage>
    );
  },
};

/** Without an intro, as most list pages are once it's been dismissed. */
export const WithoutIntro: Story = {
  args: {
    header,
    toolbar: <SegmentedControl label="Show" options={["All", "Mine", "Shared"]} value="All" onChange={() => {}} />,
    summary: `${items.length} documents`,
    children: rows,
  },
};

/** The toolbar switches views, and each view brings its own intro, or none. */
export const IntroPerView: Story = {
  render: function Render() {
    const [view, setView] = useState("ours");
    return (
      <ListPage
        header={header}
        intro={view === "ours" ? intro : undefined}
        toolbar={
          <SegmentedControl
            variant="pill"
            size="md"
            options={[
              { id: "ours", label: "Ours", count: items.length },
              { id: "shared", label: "Shared with us", count: 0 },
            ]}
            value={view}
            onChange={setView}
          />
        }
        isEmpty={view === "shared"}
        empty={<EmptyState icon={Inbox} title="Nothing has been shared with you yet." />}
      >
        {rows}
      </ListPage>
    );
  },
};

/** Nothing to list: `empty` shows in its place. */
export const Empty: Story = {
  args: {
    header,
    summary: "0 documents",
    isEmpty: true,
    empty: <EmptyState icon={Inbox} title="No documents yet." action={<Button size="sm">New document</Button>} />,
  },
};

/** Sections that follow the list, such as suggestions. */
export const WithSectionsAfter: Story = {
  args: {
    header,
    summary: `${items.length} documents`,
    children: rows,
    after: (
      <section>
        <SectionHeading title="Suggested templates" description="Start a document from one of these." />
        <ListRow icon={FileText} title="Meeting notes" description="Who came, what was decided, what's next." />
      </section>
    ),
  },
};
