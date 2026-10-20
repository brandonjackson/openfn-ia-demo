import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeftRight, Globe, LibraryBig } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { BuildingBlock, ProjectCreatePageData } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import BuildPrompt from "../components/BuildPrompt";
import BuildingBlockTile from "../components/BuildingBlockTile";
import Callout from "../components/Callout";
import IdeaCard from "../components/IdeaCard";
import SectionHeading from "../components/SectionHeading";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectCreatePageData;
}

function BlockSection({
  title,
  description,
  blocks,
  icon,
}: {
  title: string;
  description: string;
  blocks: BuildingBlock[];
  icon: LucideIcon;
}) {
  if (blocks.length === 0) return null;
  return (
    <section>
      <SectionHeading title={title} description={description} />
      <div className="-mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {blocks.map((b) => (
          <BuildingBlockTile key={b.id} block={b} icon={icon} />
        ))}
      </div>
    </section>
  );
}

/**
 * The project's starting point for something new: a "what would you like to
 * build?" prompt, starter ideas for public services, and everything the org
 * already has to build with (systems, channels and live services).
 */
export default function ProjectCreateTemplate({ node, ancestors, data }: Props) {
  // A prompt started on the project Overview arrives in router state, already
  // submitted; a draft (e.g. from "New Component") only pre-fills the box.
  const routeState = useLocation().state as { prompt?: string; draft?: string } | null;
  const initialPrompt = routeState?.prompt ?? "";
  const [prompt, setPrompt] = useState(initialPrompt || routeState?.draft || "");
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

      <BlockSection
        title="Systems"
        description="Connected systems you can read from and write to."
        blocks={data.systems}
        icon={Globe}
      />
      <BlockSection
        title="Channels"
        description="Ready-made reads, writes and events published by connected systems."
        blocks={data.channels}
        icon={ArrowLeftRight}
      />
      <BlockSection
        title="Live services"
        description="Services other projects have already published, to reuse or build on."
        blocks={data.services}
        icon={LibraryBig}
      />
    </div>
  );
}
