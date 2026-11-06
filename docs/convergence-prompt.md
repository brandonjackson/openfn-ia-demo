# The convergence prompt

Brandon's brief for bringing this app's structure in line with openfn-3-poc,
saved word for word so every session works from the same text. The handoff
and the log are in [convergence.md](./convergence.md).

---

Bring this app’s structure in line with https://github.com/OpenFn/openfn-3-poc.
Clone it next to this repo and treat it as read-only. In your first PR, save
this prompt as docs/convergence-prompt.md so later sessions can read it.

Keep
This repo’s layers (docs/architecture.md: primitives / patterns / domain /
pages, with slots), its look, its words and its Lucide icons. They’re stricter
than openfn-3's. Take only behaviour, data flow and structure from openfn-3.

Target structure

* api/ shapes: openfn-3's api/ is the contract with Lightning. Start atapi/README.md, then api/conventions.md and api/errors.md. api/register.mdlists every method. src/model/ types for API data come from it, one fileper resource (named as in api/). Split model/page-data.ts up. UI-only types(BadgeTone and the like) move to the component that owns them.
* Data: src/api/ holds the client and one hook file per resource.src/fake-api/ answers each route as api/ documents it (status, body,errors), seeded from fixtures. See openfn-3's .claude/rules/api.md.
* Pages: one folder per page (XPage.tsx, XPage.query.tsx, stories,tests), as in openfn-3's src/pages/profile/tokens/. The page takes props;the .query file calls hooks and nothing else. Wrappers never importfixtures. Add a lint rule for that once no wrapper does.
* Behaviour: openfn-3's PRINCIPLES.md and STANDARDS.md patterns (pending,errors, empty, confirm, permissions as can* props). Pattern 11 above all.
* Recent changes: `gh pr list -R OpenFn/openfn-3-poc --state merged --limit 25` and those PRs’ descriptions explain why patterns moved.


Ignore in openfn-3
It’s partly a replica of Lightning’s old UI, so skip: .replica.tsx files and
*Replica.ts, src/mock-data/, annotations/, INVENTORY.md, kickstart/,
scripts/compare-lightning/, docs/lightning-differences.md, Heroicons,
`debt:` lines, and any file over 300 lines. Don’t copy its pages or its
look.

Write down, in this repo

* docs/api-gaps.md (template: openfn-3's): anything a screen needs that api/ can’t give. Say where it shows, what it would need, and what the page does until then (leave it out, never fake it).
* docs/convergence.md: the handoff and the log.
   * “Now” at the top: the branch, the PR in progress, the next 3 items, anything half-done.
   * “Done”: one line per PR (what moved, metrics before → after), counted.
   * “Waiting on Brandon”: anything that would change how a screen looks orwhat it says. Don’t make those changes; list them and move on.
* When the structure changes, update docs/architecture.md in the same PR.


Sessions and context

* Start of every session: read docs/convergence-prompt.md and docs/convergence.md, then `git log -5` and `npm run metrics`, and carryon from “Now”. Don’t reread openfn-3's docs in full. Grep them for the pattern the current item needs.
* Run the four reviewers and any wide searches as subagents, so only their findings come back into this session, not file dumps.
* Read big files (page-data.ts, the large pages) in ranges and grep them.Don’t open them whole.
* When context is getting heavy, finish or revert the current PR (neverleave a broken branch), update “Now”, commit, and stop with: “Next session: start from docs/convergence.md”.
* A new session never needs this chat. If it can’t continue from those two files alone, add what was missing to convergence.md.

Loop (one PR each)

1. First PR: the data layer for one resource (model types from api/,fake-api route, hook), plus one page moved onto it end to end, as the worked example. Then one resource or page per PR, starting with what imports page-data.ts most, then the biggest pages (WorkflowEditorPage,ProjectSettingsPage).
2. Lint, build, test and `npm run metrics:check` must pass. Run the four reviewers from openfn-3's .claude/agents/ over the diff and fix what they clearly get right. Judgement calls go to “Waiting on Brandon”.
3. Run `npm run metrics:update`, update the docs above, and commit.
4. Every fifth PR, pull openfn-3. If api/ or a pattern changed, follow the new version.



Stop after 10 PRs in total across sessions (count them in “Done”), when page-data.ts is gone, or when only “Waiting on Brandon” items are left.
Each session ends with: what moved, the counts before → after, and the next item. The final session also lists the new api-gaps entries and the “Waiting on Brandon” list.
