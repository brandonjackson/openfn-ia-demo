# OpenFn demo

A working prototype of the next OpenFn: a redesign of Lightning's core screens (projects, workflows, sandboxes, history, settings and a new workflow editor) with the features we're exploring on top, such as connected systems, X-Road, a service catalog and AI-assisted building.

It's a React app that talks to Lightning's API. By default a pretend Lightning server runs in the browser, so it needs no backend, and everything you do is kept in localStorage. Built in lightning mode, the same app runs on a real Lightning.

## Getting started

You'll need Node 22.

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints. The settings button in the bottom-right corner of every screen switches the theme, turns features on and off, and resets the demo's data.

## What's where

```
src/
  components/
    primitives/   the smallest pieces, knowing nothing about OpenFn (Button, Card, Modal)
    patterns/     the shape of a screen, filled through slots (PageHeader, ListPage, EditorShell)
    domain/       anything in OpenFn's words (StatusPill, WorkflowCanvas, StepInspector)
  pages/          one folder per screen: the page, its wrapper, its story and its tests
  model/          types, fixed vocabulary and pure functions, shared by every layer
  api/            the API client and a file of hooks per resource
  fake-api/       the pretend Lightning server, seeded from fixtures
  fixtures/       the records a server would send
  app/            routing, the shell and app state
  docs/           the design system docs, served in the app at /docs
docs/             how it's built, and where it's heading
```

Every page is split in two. `XPage.tsx` takes everything as props and draws; `XPage.query.tsx` beside it loads the data from the API and handles what the user does. That split is what lets the same page run on the pretend server, a real Lightning, or inside Lightning's LiveView. Lint enforces the layers, so a wrong import fails with a message saying why.

## Read next

- [docs/architecture.md](docs/architecture.md): how the app is built and why. Start here.
- The design system docs, in the app at `/docs`, with a page for every component.
- Storybook (`npm run storybook`), with a story for every component and page.
- [docs/lightning-backend.md](docs/lightning-backend.md): running the app on a real Lightning.
- [docs/api-gaps.md](docs/api-gaps.md): what the screens need that Lightning's API doesn't give yet.
- [CLAUDE.md](CLAUDE.md): the detailed rules for each area, written for coding agents and handy for people too.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | The app on the pretend server |
| `npm run dev:lightning` | The app on a Lightning running at `localhost:4000`, served at `localhost:5173/v3/` |
| `npm test` | The tests (Vitest): `.test.ts` in Node, `.test.tsx` in jsdom |
| `npm run lint` | ESLint, including the layer rules |
| `npm run build` | Typecheck and build |
| `npm run storybook` | Storybook on port 6006 |
| `npm run metrics` | The ratchet: counts that can only go down (see the architecture guide) |

CI runs lint, the tests, the ratchet, the build and Storybook on every pull request. Every merge to `main` deploys the app and Storybook to GitHub Pages.
