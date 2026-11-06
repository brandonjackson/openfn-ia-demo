#!/bin/bash
# The convergence counts (docs/convergence.md): how far the structure has moved
# towards openfn-3-poc's. Prints them for the working tree, or for a git ref:
#   scripts/convergence-counts.sh          now
#   scripts/convergence-counts.sh HEAD~1   before the last commit
cd "$(dirname "$0")/.." || exit 1
ref=${1:-}
list() { if [ -n "$ref" ]; then git ls-tree -r --name-only "$ref" src; else git ls-files -co --exclude-standard src | while read -r f; do [ -e "$f" ] && echo "$f"; done; fi; }
show() { if [ -n "$ref" ]; then git show "$ref:$1"; else cat "$1"; fi; }
# A wrapper reads fixtures when it imports them, a *.fixtures helper, or a shared helper that does.
reads='from "[./]+(fixtures/|[a-z-]+\.fixtures"|project-records\.query"|channel-records\.query"|component-records\.query")'
q=0; qf=0
for f in $(list | grep -E '\.query\.tsx?$'); do
  q=$((q + 1))
  show "$f" | grep -qE "$reads" && qf=$((qf + 1))
done
echo "wrappers reading fixtures:  $qf of $q"
echo "page-data.ts lines:         $(show src/model/page-data.ts 2>/dev/null | wc -l)"
echo "files importing page-data:  $(for f in $(list | grep -E '\.(ts|tsx)$'); do show "$f" | grep -qE '(model|\.)/page-data"' && echo "$f"; done | wc -l)"
echo "pages in their own folder:  $(list | grep -E '^src/pages/[^/]+/[A-Z][A-Za-z]+Page\.tsx$' | wc -l) of $(list | grep -E '^src/pages/.*[A-Z][A-Za-z]+Page\.tsx$' | wc -l)"
echo "page and query tests:       $(list | grep -E 'Page(\.query)?\.test\.tsx$' | wc -l)"
