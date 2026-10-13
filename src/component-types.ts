import {
  ArrowLeftRight,
  Database,
  FileSpreadsheet,
  FileText,
  PanelsTopLeft,
  ScrollText,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProjectComponentType } from "./page-data";

/** Display order, icon and blurb for each kind of project component. */
export const componentTypes: {
  type: ProjectComponentType;
  plural: string;
  icon: LucideIcon;
  description: string;
}[] = [
  { type: "Workflow", plural: "Workflows", icon: Workflow, description: "Automated data pipelines and integrations." },
  { type: "Channel", plural: "Channels", icon: ArrowLeftRight, description: "Reads, writes and events on connected systems." },
  { type: "Form", plural: "Forms", icon: FileSpreadsheet, description: "Data entry and collection forms." },
  { type: "Artifact", plural: "Artifacts", icon: FileText, description: "Configuration files and mappings." },
  { type: "Collection", plural: "Collections", icon: Database, description: "Structured datasets and lookup tables." },
  { type: "AI Skill", plural: "AI Skills", icon: Sparkles, description: "Instructions and tools an AI assistant can use." },
  { type: "Document", plural: "Documents", icon: ScrollText, description: "Guides, policies and reference material." },
  { type: "Static Website", plural: "Static Websites", icon: PanelsTopLeft, description: "Public pages that show information or link to services." },
];

export const componentTypeIcons = Object.fromEntries(
  componentTypes.map((t) => [t.type, t.icon])
) as Record<ProjectComponentType, LucideIcon>;
