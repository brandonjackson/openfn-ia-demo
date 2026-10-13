import type { Meta, StoryObj } from "@storybook/react";
import ServiceCatalogCard from "./ServiceCatalogCard";
import { withRouter } from "../stories/decorators";
import { serviceCatalogData } from "../mock-data/service-catalog";
import type { CatalogEntry, WorkflowCatalogEntry } from "../page-data";

const services = serviceCatalogData.entries.filter(
  (e: CatalogEntry): e is WorkflowCatalogEntry => e.kind === "workflow"
);
const byId = (id: string) => services.find((s) => s.id === id)!;

const meta: Meta<typeof ServiceCatalogCard> = {
  title: "Components/ServiceCatalogCard",
  component: ServiceCatalogCard,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ServiceCatalogCard>;

/** Callable from workflows and exposed to agents as an MCP tool. */
export const WorkflowAndMcp: Story = { args: { entry: byId("project-a-planning-application-intake") } };

/** Callable from workflows only. */
export const WorkflowOnly: Story = { args: { entry: byId("project-b-commcare-case-sync") } };

/** A scheduled service runs on its own, so it can't be called. */
export const Scheduled: Story = { args: { entry: byId("malawi-chw-referrals-chw-referral-sync") } };
