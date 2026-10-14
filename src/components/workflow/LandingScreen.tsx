import { useState } from "react";
import { cn } from "../../utils/cn";
import Button from "../Button";
import Pill from "../Pill";
import TextLink from "../TextLink";
import AIDisclaimerFooter from "./AIDisclaimerFooter";

interface Props {
  aiAssistantEnabled?: boolean;
  onBuildWithAI: (prompt: string) => void;
  onBuildFromScratch: () => void;
  onBrowseTemplates: () => void;
  onImportYAML: () => void;
}

function OptionCard({ icon, title, description, onClick, testId }: { icon: string; title: string; description: string; onClick: () => void; testId: string }) {
  return (
    <button
      data-testid={testId}
      type="button"
      onClick={onClick}
      className="rounded-xl flex flex-col border border-gray-200 bg-white p-5 text-left hover:shadow-card transition-[color,background-color,border-color,box-shadow] focus:outline-none focus-visible:ring focus-visible:ring-gray-300"
    >
      <span className="w-fit inline-flex items-center justify-center rounded-lg bg-gray-100 p-2 mb-3">
        <span className={cn("h-5 w-5 text-gray-700", icon)} />
      </span>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </button>
  );
}

/**
 * What `/w/new` shows before there's a workflow (LandingScreen.tsx): build
 * with AI, build from scratch, browse templates, or import YAML.
 */
export default function LandingScreen({ aiAssistantEnabled = true, onBuildWithAI, onBuildFromScratch, onBrowseTemplates, onImportYAML }: Props) {
  const [prompt, setPrompt] = useState("");
  const valid = prompt.trim().length > 0;
  return (
    <div
      role="region"
      aria-labelledby="landing-screen-heading"
      className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
      data-testid="landing-screen"
      data-annotation="workflow-editor-new"
    >
      <div className="w-full md:max-w-xl flex flex-col gap-6 px-6 lg:px-2">
        <h1 id="landing-screen-heading" className="text-3xl font-semibold text-gray-900">
          Where would you like to start today?
        </h1>
        {aiAssistantEnabled && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="build-with-ai-input" className="text-sm font-semibold text-gray-900">
                Build with AI
              </label>
              <Pill color="green" className="gap-1">
                <span className="hero-sparkles-micro h-3 w-3" />
                Recommended
              </Pill>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white focus-within:shadow-card transition-shadow">
              <textarea
                id="build-with-ai-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    if (valid) onBuildWithAI(prompt);
                  }
                }}
                placeholder="e.g. Sync new KoboToolbox submissions into Postgres"
                rows={4}
                className="w-full rounded-t-lg border-none px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none bg-transparent"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <AIDisclaimerFooter muted />
                <Button size="sm" onClick={() => valid && onBuildWithAI(prompt)} disabled={!valid}>
                  Build it
                  <span className="hero-arrow-right h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <OptionCard
            testId="build-from-scratch-card"
            icon="hero-plus-circle"
            title="Build from scratch"
            description="Start with a webhook trigger and an empty first step."
            onClick={onBuildFromScratch}
          />
          <OptionCard
            testId="browse-templates-card"
            icon="hero-document-plus"
            title="Browse templates"
            description="Start from a published workflow template and adapt it."
            onClick={onBrowseTemplates}
          />
        </div>
        <p className="text-sm text-center text-gray-500">
          or{" "}
          <TextLink onClick={onImportYAML}>import a YAML file manually</TextLink>
        </p>
      </div>
    </div>
  );
}
