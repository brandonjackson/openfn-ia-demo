import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "./component-catalog";

const root = fileURLToPath(new URL("..", import.meta.url));
const catalog = buildCatalog(root);
const find = (name: string) => catalog.find((c) => c.name === name);

describe("the component catalogue behind /docs", () => {
  it("lists every layer's components", () => {
    for (const layer of ["primitives", "patterns", "domain"]) {
      expect(catalog.some((c) => c.layer === layer)).toBe(true);
    }
  });

  it("reads a component's description, props, defaults and what it extends", () => {
    const button = find("Button")!;
    expect(button.layer).toBe("primitives");
    expect(button.description).toMatch(/one button/i);
    expect(button.props.find((p) => p.name === "variant")).toMatchObject({ optional: true, defaultValue: '"primary"' });
    expect(button.extendsTypes).toContain("ButtonHTMLAttributes<HTMLButtonElement>");
    expect(button.storyId).toBe("primitives-button--primary");
    expect(button.usedBy.length).toBeGreaterThan(0);
  });

  it("reads props typed inline, with each prop's comment", () => {
    const variant = find("StatusPill")!.props.find((p) => p.name === "variant")!;
    expect(variant.type).toContain('"dot"');
    expect(variant.description).toMatch(/only the colour/);
  });

  it("lists each named export of a file without a default, like FormControls", () => {
    expect(find("TextInput")?.importLine).toBe('import { TextInput } from "../../components/primitives/FormControls";');
    expect(find("Select")?.file).toBe("src/components/primitives/FormControls.tsx");
  });

  it("finds importers by any relative path", () => {
    // StatusPill is imported by sibling domain components as "./StatusPill".
    expect(find("StatusPill")!.usedBy.some((f) => f.startsWith("src/components/domain/"))).toBe(true);
  });
});
