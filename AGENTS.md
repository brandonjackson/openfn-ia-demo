# AGENTS.md

Agent instructions for this repo live in [CLAUDE.md](./CLAUDE.md), on top of the guide for everyone in [docs/architecture.md](./docs/architecture.md). Read both before making changes, in particular the **Components and pages** and **Storybook** sections:

- Every UI element in the app must exist as a component with a Storybook story.
- Pages are built from components only, take everything as props, and are fed by the wrapper beside them.
