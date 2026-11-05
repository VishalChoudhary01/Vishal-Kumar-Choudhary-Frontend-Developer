# Labs Experiment Studio — Phase 1

**Status:** Private catalogue and owner creation foundation implemented on `feat/labs-platform-integration`. This document records the original Phase 1 slice. The isolated compiler/preview foundation has since advanced in the main Runtime and Media Plan, but deployed owner Run and public custom-experiment detail rendering are not yet release-verified; custom publishing remains gated.

## Purpose

Allow the provisioned Labs owner to create original experiment records without adding entries to the code-owned runtime registry. Each record is created as a private draft with its own slug, metadata and source workspace.

## Included

- New `lab_experiments` collection and `LabExperiment` model.
- Owner-only create endpoint: `POST /api/v1/admin/labs/experiments`.
- Owner-only creation page: `/admin/labs/experiments/new`.
- Atomic creation of metadata, an empty `lab_sources` head and an audit event.
- Existing source inventory merges the four code-owned demos with owner-created experiments.
- Existing immutable source version workflow accepts a custom slug only after its owner-created metadata exists.
- Custom records are clearly marked and remain private drafts.

## Execution and publication boundary

Custom experiment publication remains gated until the exact saved source version can be built, served in the isolated runtime, rendered on its public detail route and security-reviewed. Compiler and isolated preview foundations now exist in later integration-branch work; consult `LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md` for current status and verification gates. The existing four code-owned experiments continue using the literal runtime registry. MongoDB source contents are never evaluated by the Next.js server or inserted into the main application React tree.

## Validation required before the next phase

- Build and lint the new route, page, component, model and service changes.
- Exercise owner creation against a provisioned Preview MongoDB database.
- Verify that non-owner requests receive 403, malformed metadata is rejected and duplicate slugs return 409.
- Verify that new records appear in the owner inventory and open an empty private source workspace.
- Add safe browser-isolated preview before enabling custom publishing.
