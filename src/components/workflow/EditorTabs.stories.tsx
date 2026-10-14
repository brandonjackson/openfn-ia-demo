import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import EditorTabs from "./EditorTabs";

const meta: Meta = { title: "Workflow/EditorTabs" };
export default meta;

function PillsDemo() {
  const [v, setV] = useState<"docs" | "metadata">("docs");
  return (
    <div className="w-96 p-4">
      <EditorTabs
        value={v}
        onChange={setV}
        options={[
          { value: "docs", label: "Docs", icon: "hero-document-text" },
          { value: "metadata", label: "Metadata", icon: "hero-sparkles" },
        ]}
      />
    </div>
  );
}

export const Pills: StoryObj = { render: () => <PillsDemo /> };

function ThreeTabsDemo() {
  const [v, setV] = useState<"empty" | "custom" | "existing">("empty");
  return (
    <div className="w-96 p-4">
      <EditorTabs
        value={v}
        onChange={setV}
        options={[
          { value: "empty", label: "Empty", icon: "hero-document" },
          { value: "custom", label: "New", icon: "hero-pencil-square" },
          { value: "existing", label: "Existing", icon: "hero-queue-list" },
        ]}
      />
    </div>
  );
}
export const ThreeTabs: StoryObj = { render: () => <ThreeTabsDemo /> };
