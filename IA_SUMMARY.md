# OpenFn Information Architecture (iA) Summary

## Overview

This project is a clickable prototype of a proposed information architecture for the OpenFn integration platform. Built with React + TypeScript + Vite and deployed to GitHub Pages, it demonstrates how users would navigate and manage integration workflows across multiple external systems.

## Navigation Structure

The iA is organized into four top-level sections, plus projects and settings:

### Main Navigation

| Section | Template | Description |
|---------|----------|-------------|
| **Overview** | Dashboard | Key metrics (connected systems, active services, work orders), setup progress, and suggested services |
| **Connected Systems** | List | Browse and manage external systems with visibility filters (Available/Shared/Private) |
| **Service Catalog** | Catalog | Organization-wide index of channels (from connected systems) and workflows (from projects), grouped by department |
| **History** | Table | Filterable table of work orders and channel requests across all projects |

### Connected Systems Detail Pages

Each connected system has a dynamic detail page (`/connected-systems/{slug}`) showing:
- System metadata (URL, owner, API docs link)
- Credentials (Production & Staging)
- Channels (Read, Write, Event types) with auto-created HTTP channel

**Systems currently modeled:** DHIS2, Salesforce, CommCare, KoBoToolbox, Google Sheets, FHIR Server, OpenCRVS

### Projects (`/projects/{slug}`)

Each project contains:
- **Services** - Published integration services (Live/Draft status)
- **Components** - Workflows, Artifacts, Forms, Collections
- **Work Orders** - Links to filtered history view

**Projects currently modeled:** Project A (Planning Apps), Project B (CommCare Case Sync)

### Service Builder

Nested under projects, provides a spec-based builder with Input, Workflow/Modules, and Output stages.

### Settings

- **User Settings** - Profile
- **Org Settings** - Team/Members, Billing, Project Settings (members, concurrency, data retention, webhooks, delete)

## Architecture

### Core Files

- `src/ia-tree.ts` - Hierarchical navigation tree definitions (`IANode` interface)
- `src/ia-utils.ts` - Path resolution and dynamic routing logic
- `src/page-data.ts` - TypeScript interfaces for all page data shapes
- `src/mock-data/` - Static mock data powering all pages

### Template System

Six page templates render different data shapes:

| Template | Used By |
|----------|---------|
| `DashboardTemplate` | Overview |
| `ListTemplate` | Connected Systems |
| `DetailTemplate` | Individual system pages |
| `CatalogTemplate` | Service Catalog |
| `TableTemplate` | History |
| `ProjectTemplate` | Project pages |

### Dynamic Routing

The `dynamic: true` flag on `IANode` enables slug-based routing. When a URL segment doesn't match any sibling node by exact ID, the dynamic node captures it (e.g., `/connected-systems/dhis2` resolves to the dynamic `connected-system` template node, which then loads DHIS2-specific data from the registry).

### Key UI Components

- `Layout` / `Sidebar` - Shell with collapsible nav and project quick-access
- `Breadcrumbs` - Path-aware breadcrumb navigation
- `ChildCard` - Renders child nodes as clickable cards
- `PageShell` - Consistent page wrapper with title, description, badges, actions
- `SuggestedSystemsToAdd` - Reusable "add more systems" recommendation widget

## Development Timeline

The prototype was built across 24 PRs:

1. **Foundation** (PRs #1-2) - Vite + React + Router scaffold, GitHub Pages deployment
2. **Navigation Redesign** (PRs #3-8) - Sectioned sidebar, card-based connected systems list, visibility filters, nav icons, history table with work orders & channel requests
3. **Feature Build-out** (PRs #9-12) - OpenCRVS integration, service catalog, overview dashboard with setup module & suggested services, project architecture (services & components)
4. **Polish & Refactor** (PRs #13-18) - Metric card reordering, component type menu, project theming, work order count cards, reusable suggested-systems component, department-grouped catalog
5. **Data-Driven Architecture** (PRs #19-24) - System metadata (URL, owner, credentials, API docs), standardized template system with data registry, dynamic detail/project pages, Salesforce addition, channel restoration

## Tech Stack

- **Framework:** React 19 + React Router
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Language:** TypeScript
- **Deployment:** GitHub Pages via GitHub Actions
