/*
 * The component catalogue behind /docs: every component in src/components,
 * read from its source with the TypeScript compiler. A component's
 * description is the JSDoc over its function and its props are its props
 * type, with each prop's own comment, so the reference can't drift from the
 * code: write the comment once, beside the prop, and the docs show it.
 *
 * Served to the app as `virtual:component-catalog` by the Vite plugin at the
 * bottom of this file (vite.config.ts uses it).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";

export type CatalogLayer = "primitives" | "patterns" | "domain";

export interface CatalogProp {
  name: string;
  /** The type as written in the source, e.g. `"sm" | "md"`. */
  type: string;
  optional: boolean;
  /** The comment over the prop. */
  description: string;
  /** The value it takes when left out, read from the function's destructuring. */
  defaultValue?: string;
}

export interface CatalogEntry {
  /** The component's name, e.g. `Button`, or `TextInput` from FormControls. */
  name: string;
  layer: CatalogLayer;
  /** The file it lives in, from the repo root, e.g. `src/components/primitives/Button.tsx`. */
  file: string;
  /** How to import it from a page in `src/pages/<page>/`. */
  importLine: string;
  /** The JSDoc over the function. */
  description: string;
  props: CatalogProp[];
  /** What the props type extends, e.g. `ButtonHTMLAttributes<HTMLButtonElement>`. */
  extendsTypes: string[];
  /** The Storybook id of its first story, when it has stories, e.g. `primitives-button--primary`. */
  storyId?: string;
  /** Files in src that import it (stories and tests left out), from the repo root. */
  usedBy: string[];
}

const layers: CatalogLayer[] = ["primitives", "patterns", "domain"];
const layerTitles: Record<CatalogLayer, string> = { primitives: "Primitives", patterns: "Patterns", domain: "Domain" };

const isSource = (f: string) => /\.(ts|tsx)$/.test(f) && !/\.(stories|test)\.tsx?$/.test(f) && !f.endsWith(".d.ts");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]
  );
}

/** The text of a node's JSDoc, without the tags. */
function docOf(node: ts.Node): string {
  const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc;
  if (!docs?.length) return "";
  const comment = docs[docs.length - 1].comment;
  const text = typeof comment === "string" ? comment : (comment ?? []).map((c) => c.text).join("");
  return text.trim();
}

/** The defaults a function gives its destructured first parameter: `{ size = "md" }`. */
function defaultsOf(fn: ts.FunctionLikeDeclaration, source: ts.SourceFile): Map<string, string> {
  const out = new Map<string, string>();
  const param = fn.parameters[0];
  if (param && ts.isObjectBindingPattern(param.name)) {
    for (const el of param.name.elements) {
      const key = el.propertyName ? el.propertyName.getText(source) : el.name.getText(source);
      if (el.initializer) out.set(key, el.initializer.getText(source));
    }
  }
  return out;
}

/** The members of a props type, wherever it's declared in the file. */
function propsOf(
  typeNode: ts.TypeNode | undefined,
  source: ts.SourceFile,
  declarations: Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>
): { members: ts.TypeElement[]; extendsTypes: string[] } {
  if (!typeNode) return { members: [], extendsTypes: [] };
  if (ts.isTypeLiteralNode(typeNode)) return { members: [...typeNode.members], extendsTypes: [] };
  if (ts.isTypeReferenceNode(typeNode)) {
    const decl = declarations.get(typeNode.typeName.getText(source));
    if (!decl) return { members: [], extendsTypes: [typeNode.getText(source)] };
    if (ts.isInterfaceDeclaration(decl)) {
      const extendsTypes = (decl.heritageClauses ?? []).flatMap((h) => h.types.map((t) => t.getText(source)));
      return { members: [...decl.members], extendsTypes };
    }
    return propsOf(decl.type, source, declarations);
  }
  if (ts.isIntersectionTypeNode(typeNode)) {
    const parts = typeNode.types.map((t) => propsOf(t, source, declarations));
    return { members: parts.flatMap((p) => p.members), extendsTypes: parts.flatMap((p) => p.extendsTypes) };
  }
  return { members: [], extendsTypes: [typeNode.getText(source)] };
}

interface Found {
  name: string;
  fn: ts.FunctionLikeDeclaration;
  doc: string;
}

/** The components a file exports: its default function, or else its exported PascalCase functions. */
function componentsIn(source: ts.SourceFile, fileName: string): Found[] {
  const named: Found[] = [];
  let found: Found | undefined;
  const isExported = (n: ts.Node) =>
    ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  const isDefault = (n: ts.Node) =>
    ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
  const locals = new Map<string, Found>();

  for (const stmt of source.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      const f = { name: stmt.name.text, fn: stmt, doc: docOf(stmt) };
      locals.set(f.name, f);
      if (isDefault(stmt)) found = f;
      else if (isExported(stmt) && /^[A-Z]/.test(f.name)) named.push(f);
    }
    if (ts.isFunctionDeclaration(stmt) && !stmt.name && isDefault(stmt)) {
      found = { name: fileName, fn: stmt, doc: docOf(stmt) };
    }
    if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) {
          const f = { name: d.name.text, fn: d.initializer, doc: docOf(stmt) };
          locals.set(f.name, f);
          if (isExported(stmt) && /^[A-Z]/.test(f.name)) named.push(f);
        }
      }
    }
    if (ts.isExportAssignment(stmt) && ts.isIdentifier(stmt.expression)) {
      found = locals.get(stmt.expression.text);
    }
  }
  // A default export is the file's component, under the file's name.
  if (found) return [{ ...found, name: fileName }];
  return named;
}

/** Storybook's id for a name: lower case, runs of anything else as one hyphen. */
const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * The id of a component's first story, as Storybook makes it: the title, then
 * the first exported story's name in words (`AllStatuses` is "All Statuses").
 */
function firstStoryId(layerTitle: string, fileName: string, stories: string): string {
  const component = sanitize(`${layerTitle}-${fileName}`);
  const first = stories.match(/^export const (\w+)/m)?.[1];
  if (!first) return component;
  const words = first.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  return `${component}--${sanitize(words)}`;
}

/** The files a source file imports by relative path, resolved and without their extensions. */
function importsOf(file: string, text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(/(?:from|import)\s+["'](\.{1,2}\/[^"']+)["']/g)) {
    out.add(resolve(dirname(file), m[1]).replace(/\.(tsx?|jsx?)$/, ""));
  }
  return out;
}

export function buildCatalog(root: string): CatalogEntry[] {
  const src = join(root, "src");
  const allSources = walk(src).filter(isSource);
  const texts = new Map(allSources.map((f) => [f, readFileSync(f, "utf8")]));
  const entries: CatalogEntry[] = [];

  for (const layer of layers) {
    const dir = join(src, "components", layer);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx") && isSource(f)).sort()) {
      const path = join(dir, file);
      const text = texts.get(path) ?? readFileSync(path, "utf8");
      const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const declarations = new Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>();
      source.statements.forEach((s) => {
        if (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) declarations.set(s.name.text, s);
      });
      const fileName = basename(file, ".tsx");
      const storyPath = path.replace(/\.tsx$/, ".stories.tsx");
      const storyId = existsSync(storyPath) ? firstStoryId(layerTitles[layer], fileName, readFileSync(storyPath, "utf8")) : undefined;

      // Who imports this file, by any relative path, with or without an extension.
      const target = path.replace(/\.tsx$/, "");
      const usedBy = allSources
        .filter((f) => f !== path && importsOf(f, texts.get(f) ?? "").has(target))
        .map((f) => relative(root, f))
        .sort();

      for (const c of componentsIn(source, fileName)) {
        const typeNode = c.fn.parameters[0]?.type;
        const { members, extendsTypes } = propsOf(typeNode, source, declarations);
        const defaults = defaultsOf(c.fn, source);
        const props: CatalogProp[] = members.filter(ts.isPropertySignature).map((m) => ({
          name: m.name.getText(source),
          type: m.type ? m.type.getText(source).replace(/\s+/g, " ") : "unknown",
          optional: Boolean(m.questionToken),
          description: docOf(m),
          defaultValue: defaults.get(m.name.getText(source)),
        }));
        const isDefault = c.name === fileName;
        entries.push({
          name: c.name,
          layer,
          file: relative(root, path),
          importLine: isDefault
            ? `import ${c.name} from "../../components/${layer}/${fileName}";`
            : `import { ${c.name} } from "../../components/${layer}/${fileName}";`,
          description: c.doc,
          props,
          extendsTypes,
          storyId,
          usedBy,
        });
      }
    }
  }
  return entries;
}

const virtualId = "virtual:component-catalog";
const resolvedId = "\0" + virtualId;

/** Serves the catalogue as `virtual:component-catalog`, rebuilt when a component changes. */
export function componentCatalog(): Plugin {
  let root = process.cwd();
  return {
    name: "component-catalog",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === virtualId ? resolvedId : undefined;
    },
    load(id) {
      if (id !== resolvedId) return undefined;
      return `export default ${JSON.stringify(buildCatalog(root))};`;
    },
    handleHotUpdate({ file, server }) {
      if (!file.includes(`${join("src", "components")}`)) return;
      const mod = server.moduleGraph.getModuleById(resolvedId);
      if (mod) server.moduleGraph.invalidateModule(mod);
    },
  };
}
