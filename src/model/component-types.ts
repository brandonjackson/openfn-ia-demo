/** Display order, icon and blurb for each kind of project component. */
import { ArrowLeftRight, Database, FileSpreadsheet, FileText, PanelsTopLeft, ScrollText, Sparkles, Workflow, type LucideIcon } from "lucide-react";
import type { FeatureFlags, FlagId } from "./feature-flags";
export const componentTypes: {
  type: ProjectComponentType;
  plural: string;
  icon: LucideIcon;
  description: string;
  /** The feature flag the type belongs to, for the new kinds of component. */
  flag?: FlagId;
}[] = [
  { type: "Workflow", plural: "Workflows", icon: Workflow, description: "Automated data pipelines and integrations." },
  { type: "Channel", plural: "Channels", icon: ArrowLeftRight, description: "Reads, writes and events on other systems." },
  { type: "Form", plural: "Forms", icon: FileSpreadsheet, description: "Data entry and collection forms.", flag: "forms" },
  { type: "Artifact", plural: "Artifacts", icon: FileText, description: "Configuration files and mappings.", flag: "artifacts" },
  { type: "Collection", plural: "Collections", icon: Database, description: "Structured datasets and lookup tables." },
  { type: "AI Skill", plural: "AI Skills", icon: Sparkles, description: "Instructions and tools an AI assistant can use.", flag: "aiSkills" },
  { type: "Document", plural: "Documents", icon: ScrollText, description: "Guides, policies and reference material.", flag: "documents" },
  { type: "Static Website", plural: "Static Websites", icon: PanelsTopLeft, description: "Public pages that show information or link to services.", flag: "staticWebsites" },
];

export const componentTypeIcons = Object.fromEntries(
  componentTypes.map((t) => [t.type, t.icon])
) as Record<ProjectComponentType, LucideIcon>;

/** True when components of this type are shown: it has no flag, or its flag is on. */
export function isComponentTypeShown(type: ProjectComponentType, flags: FeatureFlags): boolean {
  const flag = componentTypes.find((t) => t.type === type)?.flag;
  return !flag || flags[flag];
}

/**
 * A project's components of the kinds the flags leave: the new kinds (forms,
 * static websites…) only with their flags, and without the Components flag
 * just the ones Lightning has, workflows and channels.
 */
export function componentsFor<C extends { type: ProjectComponentType }>(components: C[], flags: FeatureFlags): C[] {
  return components.filter((c) =>
    flags.components ? isComponentTypeShown(c.type, flags) : c.type === "Workflow" || c.type === "Channel"
  );
}

/** The kinds of component that can be listed and added besides workflows, as the flags leave them. */
export function componentTypesFor(flags: FeatureFlags): ProjectComponentType[] {
  return componentTypes
    .map((t) => t.type)
    .filter((type) => type !== "Workflow" && componentsFor([{ type }], flags).length > 0);
}

/** Kinds of building block a project is made from. */
export type ProjectComponentType =
  | "Workflow"
  | "Channel"
  | "Form"
  | "Artifact"
  | "Collection"
  | "AI Skill"
  | "Document"
  | "Static Website";

export interface ProjectComponentItem {
  id: string;
  name: string;
  description: string;
  type: ProjectComponentType;
}
