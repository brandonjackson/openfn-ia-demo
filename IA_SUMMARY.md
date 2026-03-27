# OpenFn Information Architecture (iA) Summary

## Overview

This is a clickable prototype of a proposed information architecture for the OpenFn integration platform. It demonstrates how users navigate and manage integration workflows across multiple external systems.

## Navigation Structure

The iA is organized into four top-level sections, plus projects and settings:

### Main Navigation

| Section | Description |
|---------|-------------|
| **Overview** | Key metrics (connected systems, active services, work orders), setup progress, and suggested services |
| **Connected Systems** | Browse and manage external systems with visibility filters (Available/Shared/Private) |
| **Service Catalog** | Organization-wide index of channels (from connected systems) and workflows (from projects), grouped by department |
| **History** | Filterable table of work orders and channel requests across all projects |

### Connected Systems

Each connected system has a detail page showing:
- System metadata (URL, owner, API docs link)
- Credentials (Production & Staging)
- Channels (Read, Write, Event types) with auto-created HTTP channel

**Systems currently modeled:** DHIS2, Salesforce, CommCare, KoBoToolbox, Google Sheets, FHIR Server, OpenCRVS

### Projects

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

## Page Types

Each page in the iA uses one of six layouts:

| Page Type | Used By | Description |
|-----------|---------|-------------|
| Dashboard | Overview | Metric cards, setup progress, suggested services |
| List | Connected Systems | Filterable card grid with visibility badges |
| Detail | Individual system pages | Metadata, credentials panel, channels list |
| Catalog | Service Catalog | Browsable index grouped by department/section |
| Table | History | Filtered rows with status badges and timestamps |
| Project | Project pages | Services list, components list, work order count |

## Full Site Map

```
Overview
Connected Systems
  {system-name}          (one per connected system)
    Channels
  Credentials
    Org Credentials
    User Credentials
Service Catalog
  Live Services
  Channels
History
Projects
  {project-name}         (one per project)
    Services
      {service-name}     -> opens Service Builder
    Components
      {component-name}
    Work Orders
      Runs
Service Builder
  Spec
    Input
    Workflow / Modules
    Output
User Settings
  Profile
Org Settings
  Team / Members
  Billing
  Project Settings
    Members
    Concurrency
    Data Retention
    Webhooks
    Delete
```
