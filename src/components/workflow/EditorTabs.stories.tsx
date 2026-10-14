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
        variant="pills"
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

function UnderlineDemo() {
  const [v, setV] = useState<"log" | "input" | "output">("log");
  return (
    <div className="p-4">
      <EditorTabs
        value={v}
        onChange={setV}
        options={[
          { value: "log", label: "Logs" },
          { value: "input", label: "Input" },
          { value: "output", label: "Output" },
        ]}
      />
    </div>
  );
}

export const Pills: StoryObj = { render: () => <PillsDemo /> };
export const Underline: StoryObj = { render: () => <UnderlineDemo /> };
