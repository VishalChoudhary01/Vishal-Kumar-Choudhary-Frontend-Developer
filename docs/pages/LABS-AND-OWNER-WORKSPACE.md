# Public Labs and Owner Workspace — Current Engineering Map

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Authority:** This guide describes the routes and behavior present in this branch. The PRD and retained design documents define product requirements; accepted superseding Labs decisions are recorded in [ADR-018](../DECISIONS.md#adr-018--7-november-labs-catalogue-detail-owner-and-analytics-supersession).

> **Important boundary:** Public Labs is currently a source-backed custom-experiment catalogue with a static detail page. The owner compiler, temporary Run preview, immutable artifact build and public artifact Route Handler are separate capabilities. The public detail route does not mount the interactive published artifact.

## 1. Route map and domain boundaries

| Route | Purpose | Access |
|---|---|---|
| `/labs` | Public custom-experiment collection and featured eligible experiment | Public |
| `/labs/[slug]` | Static experiment presentation, engagement and published-source access | Public page; source bytes require verified account |
| `/admin/labs/analytics` | Collection-level Labs engagement report | Owner |
| `/admin/labs/analytics/[slug]` | One-experiment analytics detail | Owner |
| `/admin/labs/sources` | Source inventory | Owner |
| `/admin/labs/sources/[slug]` | Source editor, versions, temporary Run and publish workspace | Owner |
| `/admin/labs/sources/import` | Direct import workspace retained outside the inventory navigation | Owner |
| `/admin/labs/experiments/new` | Create custom experiment metadata | Owner |
| `/admin/labs/experiments/[slug]/edit` | Edit permitted metadata fields | Owner |

Portfolio Analytics at `/admin/portfolio/analytics` is a separate product and data domain. It must not be merged with Labs source-engagement events.

## 2. Public catalogue — source-backed custom experiments only

Entry point: `src/app/labs/page.js`.

The page calls `getPublishedCustomLabExperimentPage({ limit...[truncated]