import type { Meta, StoryObj } from "@storybook/react";
import OverviewPage, { type OverviewPageData } from "./OverviewPage";
import { withRouter } from "../../stories/decorators";
import { insightsFor, weekTiles } from "../../model/insights";
import { insightsData } from "../../fixtures/insights";
import { connectedSystemSummaries, recommendedSystems } from "../../fixtures/connected-systems";
import { projectSummaries } from "../../fixtures/projects";
import { adaptors } from "../../fixtures/adaptors";

/** A busy organisation's Overview, from the fixtures' pieces. */
const data: OverviewPageData = {
  adaptors,
  tiles: weekTiles(insightsData),
  connectedSystems: connectedSystemSummaries,
  recommendedSystems,
  projects: projectSummaries,
  recommended: connectedSystemSummaries.length + recommendedSystems.length,
};

const meta: Meta<typeof OverviewPage> = {
  title: "Pages/OverviewPage",
  component: OverviewPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof OverviewPage>;

export const Default: Story = {
  args: { data },
};

export const FewSystems: Story = {
  args: { data: { ...data, connectedSystems: data.connectedSystems?.slice(0, 2) } },
};

export const FewProjects: Story = {
  args: { data: { ...data, projects: data.projects.slice(0, 2) } },
};

/** Without the Connected systems flag: no setup section. */
export const WithoutConnectedSystems: Story = {
  args: { data: { ...data, connectedSystems: undefined } },
};

/** A week with no runs yet. */
export const QuietWeek: Story = {
  args: { data: { ...data, tiles: weekTiles(insightsFor([], "Across all projects", false)) } },
};

/** You're in no projects yet. */
export const NoProjects: Story = {
  args: { data: { ...data, projects: [] } },
};
