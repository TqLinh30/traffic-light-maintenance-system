# Implementation Roadmap

## Overall Strategy
- Extend Atlas in small, reviewable increments.
- Reuse existing request, approval, work order, PM, and location features.
- Keep traffic-light-specific logic isolated and explicit.

## Phase 0
- Repository discovery and architecture mapping
- Status: completed

## Phase 1
- Business model alignment
- Goal:
  - finalize how `TrafficLightPoint` maps to Atlas entities
  - define minimal schema changes
  - define status derivation rules
  - define request metadata for QR flow
- Smallest expected output:
  - approved data model and entity mapping table
- Status:
  - completed

## Phase 2
- Minimal backend support for QR flow
- Goal:
  - add QR resolve endpoint
  - add point lookup by `qrPublicCode`
  - extend request creation payload only where needed
- Smallest expected output:
  - backend endpoint + service + migration plan
- Status:
  - completed
- Implemented:
  - `TrafficLightPoint` entity and repository
  - `QrTag` entity and repository
  - traffic-light request metadata on `Request`
  - public QR resolve and request-create endpoints
  - request lifecycle reuse through `RequestLifecycleService`
  - focused unit tests for QR request creation and point DTO derivation

## Phase 3
- Frontend QR flow
- Goal:
  - new QR landing page
  - new QR issue report form
  - confirmation page
- Smallest expected output:
  - mobile-friendly public flow that can create a request for a resolved point
- Status:
  - completed
- Implemented:
  - dedicated public QR routes under `/traffic-light/:qrPublicCode`
  - landing, request, and success states in a dedicated public page
  - point summary, status, and active work-order context
  - best-effort scan geolocation capture for request submissions
  - frontend traffic-light DTO model

## Phase 4
- Admin review flow
- Goal:
  - improve request list and detail context for traffic light operations
- Smallest expected output:
  - request list and detail surfaces expose pole code, QR source, and traffic-light metadata
- Status:
  - completed
- Implemented:
  - request frontend model now includes traffic-light metadata
  - request list now surfaces source, pole code, location, fault type, and severity
  - request detail drawer now surfaces QR context and scan metadata
  - existing approve and reject UI paths remain unchanged

## Phase 5
- Map and status layer
- Goal:
  - operational map view by point status and area
- Smallest expected output:
  - traffic-light map using status-based markers and filters
- Status:
  - completed
- Implemented:
  - dedicated internal map summary endpoint under `/traffic-light-points/map`
  - traffic-light map DTO and service mapping
  - dedicated traffic-light map tab inside locations
  - status-colored markers with location-detail drill-in
  - status and district filters for dispatch-friendly browsing

## Phase 6
- PM and history integration
- Goal:
  - connect PM schedules and maintenance history to point detail and point status
- Smallest expected output:
  - reliable next maintenance data and point history timeline
- Status:
  - completed
- Implemented:
  - internal point-detail endpoint under `/traffic-light-points/location/{locationId}`
  - PM summary read model for point detail
  - PM-aware `nextMaintenanceAt` derivation with cycle fallback
  - traffic-light detail tab inside the location drawer

## Phase 7
- Hardening, testing, optimization
- Goal:
  - optimize lookup, rendering, validation, permissions, and failure handling
- Smallest expected output:
  - index review, regression checklist, and performance improvements
- Status:
  - completed
- Implemented:
  - batched map-summary loading for work orders, PM schedules, and pending-request location ids
  - documented permission review for public and internal traffic-light endpoints
  - documented duplicate-request handling decision and residual risk
  - final regression-oriented verification pass on backend compile/tests and frontend build

## Post-Phase Localization Maintenance
- Goal:
  - add Vietnamese support and stabilize Traditional Chinese behavior without redesigning the app's i18n layer
- Smallest expected output:
  - one shared language-switch path, complete `zh_tw` key coverage, and `vi` registered for settings and public screens
- Status:
  - completed
- Implemented:
  - added `vi` loaders, locale metadata, and translation bundle
  - backfilled `zh_tw` to match the current `en` key set
  - replaced direct `i18n.changeLanguage(...)` calls in settings and public screens with a shared helper
  - fixed auth bootstrap so stored company language is no longer forced away from `EN`

## Smallest QR MVP Path
1. Phase 1: confirm the point, QR, and request metadata model.
2. Phase 2: add QR resolve backend support.
3. Phase 3: add public QR landing and submit flow.
4. Phase 4: expose traffic-light context in internal review and approval.

## Explicit Non-Goals For Early Phases
- full redesign of Atlas request or work order modules
- replacing generic portal infrastructure globally
- complex microservice split
- advanced real-time dispatching

## Current Next Step
- All planned phases are complete, and post-phase localization maintenance is complete.
- Recommended follow-up:
  - run manual UAT with seeded traffic-light data
  - verify `en`, `zh_tw`, and `vi` switching on settings and public pages
  - validate role behavior with real user accounts
  - add browser automation for QR, map, and location-detail flows
