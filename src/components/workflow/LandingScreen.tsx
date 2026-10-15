import { useState } from "react";
import { cn } from "../../utils/cn";
import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import { Label } from "../Inputs";
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
    <Card as="button" data-testid={testId} onClick={onClick} padding="lg" className="h-full text-sm text-gray-600">
      <div className="mb-3 w-fit rounded-lg bg-gray-100 p-2">
        <span className={cn("block h-5 w-5 text-gray-700", icon)} />
      </div>
      <Heading size="sm" as="p">
        {title}
      </Heading>
      <p className="mt-1">{description}</p>
    </Card>
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
      data-ui="page-body"
      data-annotation="workflow-editor-new"
    >
      <div className="flex w-full flex-col gap-6 px-6 md:max-w-xl lg:px-2">
        <Heading size="xl" as="h1" id="landing-screen-heading">
          Where would you like to start today?
        </Heading>
        {aiAssistantEnabled && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="build-with-ai-input">Build with AI</Label>
              <Pill color="green">
                <span className="hero-sparkles-micro h-3 w-3" />
                Recommended
              </Pill>
            </div>
            <Card padding="none" className="focus-within:shadow-card">
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
                className="block w-full resize-none border-none bg-transparent p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <AIDisclaimerFooter muted />
                <Button size="sm" onClick={() => valid && onBuildWithAI(prompt)} disabled={!valid}>
                  Build it
                  <span className="hero-arrow-right h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
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
        <p className="text-center text-sm text-gray-500">
          or{" "}
          <TextLink onClick={onImportYAML}>import a YAML file manually</TextLink>
        </p>
      </div>
    </div>
  );
}
