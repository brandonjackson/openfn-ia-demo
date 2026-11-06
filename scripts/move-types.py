#!/usr/bin/env python3
"""
Moves exported declarations from one module to another and rewrites every
import of them under src/. Made for splitting src/model/page-data.ts up
(docs/convergence.md), but works for any two modules.

  python3 scripts/move-types.py src/model/page-data.ts src/model/services.ts ProjectServiceItem ServiceApiSpec

Each name is an `export interface`, `export type`, `export const` or
`export function` at the top level of the source, moved with the doc comment
above it to the end of the target (created if missing). The target's own
imports are not fixed up: run `npx tsc -b` and add what it asks for.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def decl_span(lines, name):
    """The [start, end) lines of `export … name`, with the doc comment above it."""
    pat = re.compile(rf"^export (?:interface|type|const|function|enum) {re.escape(name)}\b")
    start = next((i for i, l in enumerate(lines) if pat.match(l)), None)
    if start is None:
        raise SystemExit(f"{name}: no top-level export found")
    depth, end = 0, None
    for i in range(start, len(lines)):
        for ch in lines[i]:
            if ch in "{([":
                depth += 1
            elif ch in "})]":
                depth -= 1
        s = lines[i].rstrip()
        if depth == 0 and (s.endswith(";") or s.endswith("}")):
            end = i + 1
            break
    if end is None:
        raise SystemExit(f"{name}: couldn't find where it ends")
    top = start
    # Take the comment right above only if it's one doc comment (`/** … */`),
    # never a section banner or a plain `/* */` that may sit over something else.
    if top > 0 and lines[top - 1].strip().endswith("*/"):
        j = top - 1
        while j >= 0 and not lines[j].lstrip().startswith("/*"):
            j -= 1
        if j >= 0 and lines[j].lstrip().startswith("/**") and all("*/" not in l for l in lines[j:top - 1]):
            top = j
    return top, end


def module_of(path):
    return os.path.splitext(os.path.abspath(path))[0]


def rel_import(from_file, target_module):
    r = os.path.relpath(target_module, os.path.dirname(from_file))
    return r if r.startswith(".") else "./" + r


# `import [type] [Default, ]{ … } from "…";` and `export [type] { … } from "…";`
IMPORT = re.compile(r'(import|export)\s+(type\s+)?(?:(\w+)\s*,\s*)?\{([^}]*)\}\s+from\s+"([^"]+)";\n?', re.S)


def rewrite_imports(path, src_module, dst_module, names):
    text = open(path).read()
    changed = False

    def fix(m):
        nonlocal changed
        keyword, whole_type, default, specs, spec_from = m.groups()
        if not spec_from.startswith("."):
            return m.group(0)
        if module_of(os.path.join(os.path.dirname(path), spec_from)) != src_module:
            return m.group(0)
        items = [s.strip() for s in specs.split(",") if s.strip()]
        keep, move = [], []
        for it in items:
            bare = re.sub(r"^type\s+", "", it).split(" as ")[0].strip()
            (move if bare in names else keep).append(it)
        if not move:
            return m.group(0)
        changed = True
        out = ""
        prefix = f"{keyword} type " if whole_type else f"{keyword} "
        if keep or default:
            head = f"{default}, " if default else ""
            body = f"{{ {', '.join(keep)} }}" if keep else ""
            out += f'{prefix}{head}{body}'.rstrip(", ") + f' from "{spec_from}";\n'
        if module_of(path) != dst_module:
            out += f'{prefix}{{ {", ".join(move)} }} from "{rel_import(path, dst_module)}";\n'
        return out

    text = IMPORT.sub(fix, text)
    # `import("./page-data").Name` inline type references.
    def inline(m):
        nonlocal changed
        spec_from, name = m.group(1), m.group(2)
        if name in names and module_of(os.path.join(os.path.dirname(path), spec_from)) == src_module:
            changed = True
            if module_of(path) == dst_module:
                return name
            return f'import("{rel_import(path, dst_module)}").{name}'
        return m.group(0)

    text = re.sub(r'import\("([^"]+)"\)\.(\w+)', inline, text)
    if changed:
        open(path, "w").write(merge_imports(text))
    return changed


NAMED = re.compile(r'^(import|export)( type)? \{ ([^}]*) \} from "([^"]+)";\n', re.M)


def merge_imports(text):
    """Folds imports from one module into one line: `import { b, type A } from "x"`."""
    seen = {}
    for m in list(NAMED.finditer(text)):
        key = (m.group(1), m.group(4))
        if key in seen:
            first = seen[key]
            def names(match):
                prefix = "type " if match.group(2) else ""
                return [prefix + n.strip() if not n.strip().startswith("type ") else n.strip() for n in match.group(3).split(",") if n.strip()]
            both = names(first) + names(m)
            all_types = all(n.startswith("type ") for n in both)
            listed = [n[5:] for n in both] if all_types else both
            kind = f"{m.group(1)} type" if all_types else m.group(1)
            merged = f'{kind} {{ {", ".join(dict.fromkeys(listed))} }} from "{m.group(4)}";\n'
            text = text.replace(m.group(0), "", 1).replace(first.group(0), merged, 1)
            return merge_imports(text)
        seen[key] = m
    return text


def main():
    src, dst, *names = sys.argv[1:]
    lines = open(src).read().split("\n")
    blocks, values = [], set()
    for name in names:
        top, end = decl_span(lines, name)
        declaration = next(l for l in lines[top:end] if l.startswith("export "))
        if re.match(r"^export (const|function|enum) ", declaration):
            values.add(name)
        blocks.append("\n".join(lines[top:end]))
        del lines[top:end]
        if top < len(lines) and top > 0 and lines[top] == "" and lines[top - 1] == "":
            del lines[top]
    open(src, "w").write("\n".join(lines))
    existing = open(dst).read().rstrip("\n") + "\n\n" if os.path.exists(dst) else ""
    open(dst, "w").write(existing + "\n\n".join(blocks) + "\n")

    src_module, dst_module = module_of(src), module_of(dst)
    touched = []
    for base, _, files in os.walk(os.path.join(ROOT, "src")):
        for f in files:
            if f.endswith((".ts", ".tsx")):
                p = os.path.join(base, f)
                if rewrite_imports(p, src_module, dst_module, set(names)):
                    touched.append(os.path.relpath(p, ROOT))
    # The source may still use what moved.
    body = open(src).read()
    used = [n for n in names if re.search(rf"\b{n}\b", body)]
    if used:
        kind = "import" if any(n in values for n in used) else "import type"
        open(src, "w").write(merge_imports(f'{kind} {{ {", ".join(used)} }} from "{rel_import(src, dst_module)}";\n' + body))
    print(f"moved {', '.join(names)} to {os.path.relpath(dst, ROOT)}; rewrote {len(touched)} files")


if __name__ == "__main__":
    main()
