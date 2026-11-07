/**
 * Project components whose substance is one file of content: forms,
 * artifacts, AI skills, documents and static websites. (Workflows, channels
 * and collections have their own shapes and their own API.)
 */
import type { ProjectComponentType } from "./component-types";
import type { CollectionItem } from "./collections";

/** The kinds of component that are one file of content. */
export type ContentComponentType = Extract<ProjectComponentType, "Form" | "Artifact" | "AI Skill" | "Document" | "Static Website">;

export const contentComponentTypes: ContentComponentType[] = ["Form", "Artifact", "AI Skill", "Document", "Static Website"];

export function isContentComponentType(type: ProjectComponentType): type is ContentComponentType {
  return (contentComponentTypes as ProjectComponentType[]).includes(type);
}

/** How each kind's content is written: the file it reads as, its language, and what it holds. */
export const contentFormats: Record<ContentComponentType, { file: string; language: "json" | "markdown" | "html"; about: string }> = {
  Form: { file: "form.json", language: "json", about: "The form's fields, in the order they're asked." },
  Artifact: { file: "artifact.json", language: "json", about: "The file workflows read: a mapping, a lookup or a configuration." },
  "AI Skill": { file: "SKILL.md", language: "markdown", about: "What the skill is for and the steps an assistant follows when it uses it." },
  Document: { file: "document.md", language: "markdown", about: "The document, in Markdown." },
  "Static Website": { file: "index.html", language: "html", about: "The site's page, in HTML." },
};

/** True when a kind's content must parse as JSON before it's saved. */
export const isJsonContent = (type: ContentComponentType) => contentFormats[type].language === "json";

/** What a new component of a kind starts with. */
export function starterContent(type: ContentComponentType, name: string): string {
  switch (type) {
    case "Form":
      return JSON.stringify(
        { title: name, fields: [{ name: "full_name", label: "Full name", type: "text", required: true }] },
        null,
        2,
      );
    case "Artifact":
      return "{\n  \n}";
    case "AI Skill":
      return `# ${name}\n\nWhen to use this skill:\n\n- \n\nSteps:\n\n1. \n`;
    case "Document":
      return `# ${name}\n\n`;
    case "Static Website":
      return `<!doctype html>\n<html>\n  <head>\n    <title>${name}</title>\n  </head>\n  <body>\n    <h1>${name}</h1>\n  </body>\n</html>\n`;
  }
}

/** What's typed to make or rename a component. */
export interface ComponentDraft {
  name: string;
  description: string;
}

/** Problems with a draft, by field, before it's sent: a name, unique among the project's components of that kind. */
export function componentDraftErrors(draft: ComponentDraft, takenNames: string[]): Partial<Record<keyof ComponentDraft, string>> {
  const name = draft.name.trim();
  if (!name) return { name: "Give it a name." };
  if (takenNames.some((t) => t.toLowerCase() === name.toLowerCase())) return { name: "Another component in this project has that name." };
  return {};
}

/** Why content can't be saved as it is, or undefined when it can. */
export function contentError(type: ContentComponentType, content: string): string | undefined {
  if (!isJsonContent(type)) return undefined;
  try {
    JSON.parse(content);
    return undefined;
  } catch {
    return "This isn't valid JSON yet.";
  }
}

/** A component's content as it stands on the server. */
export interface ComponentContent {
  content: string;
  /** When it last changed, for display ("3 hours ago"). */
  updatedAt: string;
  /** Who changed it last. */
  updatedBy?: string;
}

/** What a collection holds, as its view shows it. */
export interface CollectionContents {
  /** Its keys, newest first: up to a page of them. */
  items: CollectionItem[];
  /** How many keys it holds in all. */
  itemCount: number;
  /** Their size, in bytes. */
  byteSize: number;
}
