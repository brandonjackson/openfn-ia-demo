import type { Meta, StoryObj } from "@storybook/react";
import PageContainer from "./PageContainer";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";

const meta: Meta<typeof PageContainer> = {
  title: "Components/PageContainer",
  component: PageContainer,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  render: () => (
    <div className="p-8">
      <PageContainer>
        <div className="space-y-8">
          <PageHeader title="Workflows" description="Every workflow in this project." />
          <EmptyState title="Page content sits in a centred column, at most 1024px wide." />
        </div>
      </PageContainer>
    </div>
  ),
};
