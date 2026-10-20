import type { Meta, StoryObj } from "@storybook/react";
import { ClipboardList, Download, Plus, Users } from "lucide-react";
import PageHeader from "./PageHeader";
import Badge from "./Badge";
import Button from "./Button";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    breadcrumbs: { ancestors: [{ label: "Home", path: "/" }], current: "Projects" },
    title: "Projects",
    description: "Workspaces that group workflows, credentials and collaborators.",
  },
};

export const WithActions: Story = {
  args: {
    breadcrumbs: { ancestors: [{ label: "Home", path: "/" }], current: "Connected Systems" },
    title: "Connected Systems",
    description: "Systems your organization has connected to OpenFn.",
    actions: (
      <>
        <Button variant="secondary" size="sm" icon={Download}>
          Export
        </Button>
        <Button size="sm" icon={Plus}>
          Add system
        </Button>
      </>
    ),
  },
};

export const RecordPage: Story = {
  name: "Record page (icon and badges)",
  args: {
    breadcrumbs: { ancestors: [{ label: "Services", path: "/service-catalog" }], current: "Birth registration" },
    icon: ClipboardList,
    title: "Birth registration",
    badges: (
      <>
        <Badge label="Live" />
        <Badge label="Org-shared" tone="blue" icon={Users} />
      </>
    ),
    description: "Registers a new birth with the civil registry and notifies the health ministry.",
  },
};

export const TitleOnly: Story = {
  args: { title: "Overview" },
};
