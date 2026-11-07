import { useState } from "react";
import type { PageProps } from "../../model/ia-tree";
import type { BuildIdea } from "../../model/build-ideas";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import BuildPrompt from "../../components/domain/BuildPrompt";
import Callout from "../../components/primitives/Callout";
import IdeaCard from "../../components/domain/IdeaCard";
import SectionHeading from "../../components/primitives/SectionHeading";

/** What the Create page shows. */
export interface ProjectCreatePageData {
  /** Starter ideas for a new public service; picking one fills the prompt box. */
  ideas: BuildIdea[];
}

export interface ProjectCreatePageProps extends PageProps<ProjectCreatePageData> {
  /** A prompt started on the project Overview: it arrives already submitted. */
  initialPrompt?: string;
  /** A draft, e.g. from adding a component: it only pre-fills the box. */
  initialDraft?: string;
}

/**
 * The project's starting point for something new: a "what would you like to
 * build?" prompt and starter ideas for public services.
 */
export default function ProjectCreatePage({
  node,
  ancestors,
  data,
  initialPrompt = "",
  initialDraft,
}: ProjectCreatePageProps) {
  // A prompt started on the project Overview arrives already submitted; a
  // draft (e.g. from "New Component") only pre-fills the box.
  const [prompt, setPrompt] = useState(initialPrompt || initialDraft || "");
  const [submitted, setSubmitted] = useState<string | null>(initialPrompt || null);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-gray-900">What would you like to build?</h1>
        <p className="mt-2 text-sm text-gray-500">
          Describe a public service in plain words. Think about who it helps and which systems
          need to talk to each other; we'll draft the workflows and channels for you.
        </p>
        <div className="mt-6 text-left">
          <BuildPrompt
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => prompt.trim() && setSubmitted(prompt.trim())}
          />
        </div>
        {submitted && (
          <div className="mt-4 text-left">
            <Callout variant="info" title="Drafting your service">
              This is a demo, so nothing is built yet. In the product, the assistant would now
              propose workflows and channels for: “{submitted}”
            </Callout>
          </div>
        )}
      </div>

      <section>
        <SectionHeading
          title="Ideas to get you started"
          description="New services you could build from the systems your organization already has."
        />
        <div className="-mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onSelect={(i) => setPrompt(i.prompt)} />
          ))}
        </div>
      </section>
    </div>
  );
}
