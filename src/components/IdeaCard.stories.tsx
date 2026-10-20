import type { Meta, StoryObj } from "@storybook/react";
import IdeaCard from "./IdeaCard";
import { buildIdeas } from "../mock-data/build-ideas";

const meta: Meta<typeof IdeaCard> = {
  title: "Components/IdeaCard",
  component: IdeaCard,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof IdeaCard>;

export const Default: Story = { args: { idea: buildIdeas[0] } };

/** An idea that connects three systems. */
export const ManySystems: Story = { args: { idea: buildIdeas[1] } };
