import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import BuildPrompt from "./BuildPrompt";
import { buildIdeas } from "../mock-data/build-ideas";

function Controlled({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return <BuildPrompt value={value} onChange={setValue} />;
}

const meta: Meta<typeof BuildPrompt> = {
  title: "Components/BuildPrompt",
  component: BuildPrompt,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BuildPrompt>;

/** Empty, so the Build button is disabled. */
export const Empty: Story = { render: () => <Controlled initial="" /> };

/** Filled from one of the starter ideas. */
export const Filled: Story = { render: () => <Controlled initial={buildIdeas[0].prompt} /> };
