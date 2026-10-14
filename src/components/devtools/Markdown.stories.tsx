import type { Meta, StoryObj } from "@storybook/react";
import Markdown from "./Markdown";
import { withWhitePanel } from "../../stories/decorators";

const meta: Meta<typeof Markdown> = {
  title: "Devtools/Markdown",
  component: Markdown,
  args: {
    source:
      "## Heading\n\nSome **bold** text, `code`, and a [link](https://docs.openfn.org).\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```\nfn(state => state)\n```\n\n<script>alert('shown as text')</script>",
  },
  decorators: [withWhitePanel("w-100")],
};
export default meta;
export const Default: StoryObj<typeof Markdown> = {};

export const GherkinScenarios: StoryObj<typeof Markdown> = {
  args: {
    source:
      "## 5. Scenarios\n\n```gherkin\nFeature: Project workflows dashboard\n  In order to see what my project's workflows are doing\n  As a member of a project\n  I want a list of workflows with their recent activity\n\n  @S01 @pending\n  Scenario: Member sees the project's workflows with recent activity\n    # Value: anyone on the project can tell at a glance which workflows are healthy.\n    Given I am a viewer on project \"Malawi HIV\"\n    When I open the workflows page\n    Then I see \"Workflows (3)\"\n    And the \"Intake\" row shows its latest work order state\n    # index.ex:151-170; dashboard_components.ex:93-107\n```",
  },
};
