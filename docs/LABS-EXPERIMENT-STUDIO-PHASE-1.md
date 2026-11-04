# Labs Experiment Studio — Phase 1

**Status:** Implemented on `feat/labs-platform-integration` as a private catalogue foundation. Isolated runtime execution and public custom-experiment publication remain deferred.

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

Custom experiment publication is rejected until isolated preview execution has been implemented and validated. The existing four code-owned experiments continue using the literal runtime registry. MongoDB source contents are never evaluated by the Next.js server or inserted into the main application React tree.

## Validation required before the next phase

- Build and lint the new route, page, component, model and service changes.
- Exercise owner creation against a provisioned Preview MongoDB database.
- Verify that non-owner requests receive 403, malformed metadata is rejected and duplicate slugs return 409.
- Verify that new records appear in the owner inventory and open an empty private source workspace.
- Add safe browser-isolated preview before enabling custom publishing.
