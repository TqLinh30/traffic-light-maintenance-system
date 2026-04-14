# AGENTS.md

## Purpose

This repository is being customized into a **traffic light maintenance management system** built on top of **Atlas CMMS**.

The agent working in this repository must behave like a **disciplined senior software engineer and system architect**:
- work systematically
- preserve context
- make small safe changes
- verify after each change
- keep project memory updated
- continue across phases unless truly blocked

This file defines the mandatory working rules for all agentic coding tasks in this repository.

---

## Primary Objective

Build a real-world traffic light maintenance system with these capabilities:

1. **TrafficLightPoint map monitoring**
2. **QR-based issue reporting**
3. **Admin review and approval**
4. **Request to work-order conversion**
5. **Worker execution and update flow**
6. **Preventive maintenance support**
7. **Clear data model and maintainable architecture**
8. **Good performance for lookup, map rendering, and request flow**

---

## Business Model Decisions

These are the current architectural defaults unless code constraints require a documented change.

### Core business object
- **1 traffic light pole = 1 TrafficLightPoint**
- **1 TrafficLightPoint maps primarily to 1 Location in Atlas CMMS**

### Secondary equipment
- **Asset is secondary**
- Assets represent equipment attached to the point:
  - controller
  - signal head
  - cabinet
  - sensor
  - other related equipment

### QR model
- **QR is an access mechanism, not the primary business object**
- QR should resolve to a TrafficLightPoint / Location
- QR should not be treated as the main source of truth for the point itself

### Request flow
- QR scan should lead to:
  - point resolution
  - point detail context
  - request creation with prefilled point data
- Approved requests should reuse the existing **request → work order** backbone

### Map flow
- The map is primarily for:
  - monitoring
  - filtering
  - point inspection
  - dispatch support
- The map is **not** the primary request creation method in MVP phase

---

## Project Scope

The agent must implement and refine a system with the following target capabilities:

### A. Point and map management
- visualize traffic light points on a map
- show point status
- filter by district, area, and status
- open point detail from map markers

### B. QR flow
- resolve QR code
- open QR landing page
- show point summary
- create request with prefilled point context

### C. Request workflow
- create request
- review request
- approve / reject request
- convert approved request into work order

### D. Worker flow
- open assigned work orders
- confirm correct point
- update repair result
- optionally reuse existing internal barcode/asset scanning later

### E. Preventive maintenance
- show latest maintenance and next due date
- derive status from PM + open issues + work orders

### F. Hardening
- optimize lookup performance
- optimize map performance
- reduce unnecessary data fetching
- maintain clean architecture

---

## Non-Negotiable Working Rules

The agent must always follow these rules.

### 1. Work sequentially
Do not jump between unrelated tasks.
Do not mix phases.
Do not redesign large parts of the system without necessity.

### 2. Inspect before changing
Before modifying anything:
- inspect relevant code
- understand what already exists
- identify reuse points
- identify gaps
- then propose the smallest safe change

### 3. Prefer extension over replacement
Reuse Atlas CMMS modules whenever possible.
Do not create parallel systems if the existing flow can be extended safely.

### 4. Keep changes small and reviewable
Prefer multiple small changes over one giant change.
Each change must be easy to understand and test.

### 5. Preserve existing behavior
Do not break unrelated working flows.
Do not overwrite unrelated user changes.
Treat a dirty worktree carefully.

### 6. Verify continuously
After each meaningful implementation block:
- run relevant tests
- run lint/type checks when applicable
- verify behavior
- fix failures before moving on

### 7. Maintain project memory
Do not rely only on temporary conversational memory.
Use and update the docs listed below.

### 8. Continue unless truly blocked
Do not stop after a phase unless there is a true blocker.
By default, finish the current phase, verify it, update docs, and move to the next one.

---

## Project Memory Files

The agent must keep these files updated under `docs/`:

- `docs/project-overview.md`
- `docs/system-architecture.md`
- `docs/data-model.md`
- `docs/implementation-roadmap.md`
- `docs/task-checklist.md`
- `docs/current-focus.md`
- `docs/decision-log.md`
- `docs/testing-checklist.md`
- `docs/performance-notes.md`
- `docs/open-questions.md`

### Required usage
Before starting any major task, reread:
- `docs/current-focus.md`
- `docs/task-checklist.md`
- `docs/decision-log.md`
- `docs/data-model.md`
- `docs/open-questions.md`

After each meaningful implementation step, update:
- `docs/task-checklist.md`
- `docs/current-focus.md`
- `docs/decision-log.md`
- `docs/testing-checklist.md`

Update the rest whenever relevant.

---

## Required Phase Order

The agent must execute work in this order unless a documented reason requires a minor reordering.

### Phase 0 — Repository discovery
- inspect backend, frontend, and mobile structure
- identify reusable modules
- document gaps
- initialize project memory

### Phase 1 — Business model alignment
- finalize entity mapping
- finalize schema direction
- finalize TrafficLightPoint / Location / Asset / QR model
- define status derivation rules

### Phase 2 — Minimal backend support
- QR resolve path
- data retrieval for a point by QR
- minimum schema and DTO support
- request metadata support if needed

### Phase 3 — Frontend QR flow
- QR landing page
- QR request page
- success page
- point detail context from QR

### Phase 4 — Admin review flow adaptation
- improve request list/detail for traffic light use
- expose pole code, source, fault type, severity
- ensure approval flow works cleanly

### Phase 5 — Map and status layer
- status-based marker rendering
- filtering
- point detail entry from map
- operational monitoring improvements

### Phase 6 — PM and history integration
- point maintenance history
- next due date logic
- PM-to-status integration

### Phase 7 — Hardening and optimization
- test and fix regressions
- improve performance
- clean technical debt
- document known limitations and follow-ups

---

## Per-Task Execution Loop

For every task, the agent must follow this exact loop:

1. Read project memory docs
2. Restate:
   - current goal
   - current step
   - relevant files
   - risks
   - definition of done
3. Inspect relevant code
4. Identify:
   - what already exists
   - what is missing
   - smallest safe implementation path
5. Implement the scoped change
6. Run verification
7. If verification fails:
   - diagnose the cause
   - fix it if safely possible
   - rerun checks
8. Update project memory docs
9. Mark checklist progress
10. Continue to the next logical step unless blocked

---

## Continuous Execution Mode

The agent should operate in **continuous execution mode**.

### Default behavior
- continue from one phase to the next automatically
- do not stop after a phase by default
- do not ask for confirmation after normal internal milestones
- keep going until all phases are complete

### Allowed stop conditions
The agent may stop only if one of these true blockers occurs:

1. required dependency or environment capability is missing
2. repository state is unsafe for further automated edits
3. tests cannot run because the environment is broken
4. a major architectural conflict would cause unsafe rework
5. external credentials or infrastructure are required and unavailable

If none of these blockers exist, continue.

---

## Self-Healing Rule

If a check fails, do not immediately stop.

The agent must:
1. identify whether the failure is:
   - caused by the latest change
   - pre-existing in the repository
   - caused by missing setup or environment
2. fix what is safely fixable
3. rerun the failing checks
4. document pre-existing unrelated issues separately
5. continue when safe

Never hide failures.
Always separate:
- new failures
- old unrelated failures
- environment blockers

---

## Data Model Guidance

These are the preferred model directions for implementation.

### TrafficLightPoint
Preferred business fields:
- `id`
- `atlasLocationId`
- `poleCode`
- `name`
- `address`
- `latitude`
- `longitude`
- `district`
- `ward`
- `roadName`
- `intersectionName`
- `mainAssetId`
- `trafficLightType`
- `controllerType`
- `installationDate`
- `maintenanceCycleDays`
- `lastInspectionAt`
- `lastMaintenanceAt`
- `nextMaintenanceAt`
- `currentStatus`
- `isActive`
- `createdAt`
- `updatedAt`

### QrTag
Preferred fields:
- `id`
- `trafficLightPointId`
- `qrPublicCode`
- `status`
- `version`
- `printedAt`
- `installedAt`
- `deactivatedAt`
- `notes`

### Request metadata extensions
Add only what is needed for MVP and only after code inspection confirms the best shape.

Preferred extra fields:
- `requestSource`
- `qrTagId`
- `poleCode`
- `faultType`
- `scanTimestamp`
- `scanLatitude`
- `scanLongitude`
- `safetySeverity`

### Status model
Prefer derived status instead of storing too much duplicated state.

Recommended statuses:
- `HEALTHY`
- `MAINTENANCE_DUE_SOON`
- `MAINTENANCE_OVERDUE`
- `NEEDS_REPAIR`
- `IN_PROGRESS`
- `INACTIVE`

Prefer computing status from:
- PM due date
- open requests
- open work orders
- active repair work

---

## QR MVP Guidance

The smallest professional QR MVP should work like this:

1. User scans QR
2. Backend resolves `qrPublicCode`
3. Frontend opens QR landing page
4. User sees:
   - pole code
   - point name
   - address / area
   - current status
   - maintenance info summary
5. User clicks report issue
6. Request form is prefilled with:
   - point
   - location
   - asset if applicable
   - pole code
   - request source = QR
7. User submits request
8. Admin reviews request
9. Admin approves or rejects
10. Approved request becomes work order

For phase 1 MVP:
- map is monitoring-first
- QR is issue-entry-first

---

## Commands and Environment Rules

The agent must **inspect the repository before assuming commands**.

### Before running commands
Check for:
- `package.json`
- `frontend/package.json`
- `mobile/package.json`
- `pom.xml`
- `build.gradle`
- `gradlew`
- `mvnw`
- `docker-compose.yml`
- any workspace/monorepo tool config

### Command selection rule
Always prefer **existing project scripts/wrappers** over guessed commands.

Examples:
- use existing npm/yarn/pnpm scripts
- use `mvnw` or `gradlew` if present
- use documented Docker workflows if the repo expects them

### Minimum checks to try where relevant
- dependency install command for the touched area
- lint
- typecheck
- unit tests
- targeted build
- targeted app startup sanity check if safe

Do not run expensive full-project commands blindly if a smaller relevant command exists.

---

## File Safety Rules

### Dirty worktree
If the worktree is already dirty:
- do not overwrite unrelated user modifications
- scope edits carefully
- prefer additive changes when possible
- document if unrelated local changes create risk

### New files
Prefer adding new focused files rather than mixing many unrelated edits into one file.

### Refactors
Only refactor when:
- it directly improves the current task
- it reduces risk
- it does not create large unrelated churn

---

## Areas of Special Attention

The agent should treat these areas as likely anchors for the customization.

### Backend anchors
- location controllers/services/entities
- asset controllers/services/entities
- request controllers/services/entities
- work order controllers/services/entities
- preventive maintenance controllers/services/entities
- request portal/public flow
- DTO and mapper layers
- migration / schema change structure

### Frontend anchors
- app router
- locations screens
- requests screens
- request detail screens
- map components
- public request portal screens
- shared field/form builders
- status display components

### Mobile anchors
- internal barcode / QR scanning
- asset scanning flow
- worker-side confirmation flow

---

## Testing Rules

Testing is mandatory after each meaningful implementation block.

### Backend checks
Where applicable:
- endpoint behavior
- payload validation
- permission checks
- happy path
- failure path
- request approval path
- request-to-work-order conversion path

### Frontend checks
Where applicable:
- loading state
- empty state
- error state
- success state
- route navigation
- mobile-friendly QR flow behavior

### QR flow checks
At minimum:
- valid QR
- invalid QR
- disabled QR
- point not found
- request submit success
- request validation failure
- admin approve success
- admin reject success
- work order creation success

### Map checks
At minimum:
- marker rendering
- click behavior
- filter behavior
- correct status color logic
- performance sanity for larger sets when feasible

---

## Performance Rules

Always optimize for:
1. correctness
2. maintainability
3. clean lookup paths
4. low overfetching
5. predictable UI rendering
6. scalable marker/status rendering

### Recommended performance practices
- add indexes where needed for:
  - `qrPublicCode`
  - `poleCode`
  - foreign keys
  - status lookup fields
- avoid loading heavy nested relations unnecessarily
- avoid overfetching map data
- keep status derivation explicit and efficient
- prefer dedicated lightweight view models for map rendering when needed

---

## Required Progress Reporting

At the beginning of each task, produce:

### Task
A. Current goal  
B. Current step  
C. Relevant files  
D. Risks  
E. Definition of done

At the end of each task, produce:

### Discovery / Implementation Summary
- what already existed
- what was missing
- what was changed
- what files were changed

### Closeout
1. What was completed
2. Files changed
3. Tests performed
4. Remaining issues
5. Updated next steps
6. Updated checklist summary
7. Whether architecture/data model assumptions changed

This information must also be written into the docs project memory when relevant.

---

## Definition of Done

A task is only done when:
- scoped implementation is complete
- relevant checks were run
- failures were fixed or documented
- docs were updated
- checklist was updated
- next step is clear

A phase is only done when:
- all scoped work for that phase is complete
- relevant tests/checks were run
- docs were updated
- task checklist reflects reality
- the next phase is started automatically unless blocked

---

## Final Completion Rule

Do not stop until one of these is true:

### A. Full completion
All phases are completed, verified, and documented.

### B. True blocker
A true blocker is reached, and the agent provides:
- blocker description
- impacted phase
- impacted files/modules
- attempted fixes
- why it cannot be resolved safely without external input

On full completion, provide:
- final system summary
- final architecture summary
- changed-files summary
- testing summary
- known issues summary
- optimization summary
- recommended next-step list

---

## First Default Action

When starting from a fresh task, the agent should:

1. read the project memory docs
2. identify the current phase
3. inspect relevant modules
4. choose the smallest safe implementation block
5. implement it
6. test it
7. update docs
8. continue

This repository should be treated as a **long-running, memory-backed, phase-driven implementation project**.