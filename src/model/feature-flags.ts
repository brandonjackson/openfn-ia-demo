/**
 * The demo's feature flags: the new concepts it shows on top of a redesign of
 * today's Lightning. With every flag on you see the full vision; with every
 * flag off you see the redesign at roughly Lightning's scope (projects,
 * workflows, channels, sandboxes, history, settings and the new editor).
 *
 * The new editor isn't a flag: it's always on, so the old one is never built.
 *
 * A flag can require others. It only takes effect when everything it
 * requires is in effect too, so turning X-Road on while Connected systems is
 * off leaves X-Road off (the flag panel says why) rather than quietly turning
 * Connected systems on.
 */

export type FlagId =
  | "organizations"
  | "connectedSystems"
  | "xroad"
  | "ecosystemMap"
  | "serviceCatalog"
  | "handbook"
  | "aiBuild"
  | "deployments"
  | "workflowDocs"
  | "envVars"
  | "testCases"
  | "components"
  | "forms"
  | "staticWebsites"
  | "aiSkills"
  | "documents"
  | "artifacts";

/** Which flags are on: either as chosen, or in effect once requirements are applied. */
export type FeatureFlags = Record<FlagId, boolean>;

export interface FeatureFlag {
  id: FlagId;
  label: string;
  /** What turning it off takes away, in a sentence. */
  description: string;
  /** Flags this one needs. It's in effect only when all of them are. */
  requires: FlagId[];
  /** Heading the flag panel lists it under. */
  group: "Organization" | "Projects" | "Components";
}

export const featureFlags: FeatureFlag[] = [
  {
    id: "organizations",
    label: "Organizations",
    description:
      "The organization layer: Overview as home, org-wide Status, Insights and History, and Organization settings. Off, home is the projects list.",
    requires: [],
    group: "Organization",
  },
  {
    id: "connectedSystems",
    label: "Connected systems",
    description:
      "The Systems pages and a step's connected system. Off, a step is an adaptor and a credential.",
    requires: ["organizations"],
    group: "Organization",
  },
  {
    id: "xroad",
    label: "X-Road",
    description:
      "Reaching systems over X-Road, publishing services to it, and the organization's X-Road identity.",
    requires: ["connectedSystems"],
    group: "Organization",
  },
  {
    id: "ecosystemMap",
    label: "Ecosystem map",
    description: "The Ecosystem view of the Systems page: systems as stations and workflows as lines.",
    requires: ["connectedSystems"],
    group: "Organization",
  },
  {
    id: "serviceCatalog",
    label: "Service catalog",
    description:
      "Published services: the Services page, each service's page, and editing a service on its webhook trigger.",
    requires: ["organizations"],
    group: "Organization",
  },
  {
    id: "handbook",
    label: "Handbook",
    description: "The organization's handbook of partners, agreements and conventions.",
    requires: ["organizations"],
    group: "Organization",
  },
  {
    id: "aiBuild",
    label: "Build with AI",
    description: "A project's Create page: describe what you need and AI drafts it. The editor's assistant stays.",
    requires: [],
    group: "Projects",
  },
  {
    id: "deployments",
    label: "Deployments",
    description: "A project's Deployments page.",
    requires: [],
    group: "Projects",
  },
  {
    id: "workflowDocs",
    label: "Workflow docs",
    description:
      "The Workflow section of the editor's explorer: workflow.yaml, context.md, spec.md, service.yaml, Health and new docs.",
    requires: [],
    group: "Projects",
  },
  {
    id: "envVars",
    label: "Environment variables",
    description: "A project's environment variables, set for each environment, under Workflow in the editor's explorer.",
    requires: ["workflowDocs"],
    group: "Projects",
  },
  {
    id: "testCases",
    label: "Test cases",
    description:
      "A workflow's test cases under Workflow in the editor's explorer: scenarios in plain words that the assistant runs, generates from the spec and checks with deterministic tests.",
    requires: ["workflowDocs"],
    group: "Projects",
  },
  {
    id: "components",
    label: "Components",
    description:
      "A project's building blocks beyond workflows, on the Components page and in the editor. Off, the project has a Channels page, as Lightning does.",
    requires: [],
    group: "Components",
  },
  { id: "forms", label: "Forms", description: "Form components.", requires: ["components"], group: "Components" },
  {
    id: "staticWebsites",
    label: "Static websites",
    description: "Static website components.",
    requires: ["components"],
    group: "Components",
  },
  { id: "aiSkills", label: "AI skills", description: "AI skill components.", requires: ["components"], group: "Components" },
  { id: "documents", label: "Documents", description: "Document components.", requires: ["components"], group: "Components" },
  { id: "artifacts", label: "Artifacts", description: "Artifact components.", requires: ["components"], group: "Components" },
];

const flagIds = featureFlags.map((f) => f.id);

function every(on: boolean): FeatureFlags {
  return Object.fromEntries(flagIds.map((id) => [id, on])) as FeatureFlags;
}

export const allFlagsOn: FeatureFlags = every(true);
export const allFlagsOff: FeatureFlags = every(false);

export interface FlagPreset {
  id: string;
  label: string;
  description: string;
  flags: FeatureFlags;
}

export const flagPresets: FlagPreset[] = [
  { id: "full", label: "Full vision", description: "Every new feature on.", flags: allFlagsOn },
  {
    id: "redesign",
    label: "Lightning redesign",
    description: "Every new feature off: the new design at today's scope.",
    flags: allFlagsOff,
  },
];

export function isFlagId(value: string): value is FlagId {
  return (flagIds as string[]).includes(value);
}

export function flagById(id: FlagId): FeatureFlag {
  return featureFlags.find((f) => f.id === id)!;
}

/** Which flags are in effect: a chosen flag counts only if everything it requires is in effect. */
export function effectiveFlags(chosen: FeatureFlags): FeatureFlags {
  const memo: Partial<FeatureFlags> = {};
  const resolve = (id: FlagId): boolean => {
    if (memo[id] === undefined) {
      memo[id] = chosen[id] && flagById(id).requires.every(resolve);
    }
    return memo[id]!;
  };
  return Object.fromEntries(flagIds.map((id) => [id, resolve(id)])) as FeatureFlags;
}

/**
 * The flag a flag sits under in the flag panel: the first flag it requires
 * in its own group. Undefined for a flag at the top of its group.
 */
export function flagParent(flag: FeatureFlag): FlagId | undefined {
  return flag.requires.find((r) => flagById(r).group === flag.group);
}

/** The flags `id` directly requires that aren't in effect, for "Needs Connected systems". */
export function missingRequirements(id: FlagId, chosen: FeatureFlags): FlagId[] {
  const effective = effectiveFlags(chosen);
  return flagById(id).requires.filter((r) => !effective[r]);
}

/**
 * Reads a `flags` URL parameter: a preset id ("full", "redesign"), or a
 * comma-separated list of the flags to turn on, where "-id" turns one off
 * from the full vision instead (`-xroad,-ecosystemMap`). Undefined if it
 * doesn't parse.
 */
export function parseFlagsParam(value: string): FeatureFlags | undefined {
  const preset = flagPresets.find((p) => p.id === value);
  if (preset) return preset.flags;
  const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  const subtract = parts.every((p) => p.startsWith("-"));
  const ids = parts.map((p) => p.replace(/^-/, ""));
  if (!ids.every(isFlagId)) return undefined;
  const base = subtract ? { ...allFlagsOn } : { ...allFlagsOff };
  for (const id of ids as FlagId[]) base[id] = !subtract;
  return base;
}

/** The shortest `flags` URL parameter that gives these choices. */
export function flagsParam(chosen: FeatureFlags): string {
  const preset = flagPresets.find((p) => flagIds.every((id) => p.flags[id] === chosen[id]));
  if (preset) return preset.id;
  const on = flagIds.filter((id) => chosen[id]);
  const off = flagIds.filter((id) => !chosen[id]);
  return off.length <= on.length ? off.map((id) => "-" + id).join(",") : on.join(",");
}
