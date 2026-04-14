# Task Checklist

## Phase 0 - Repository Discovery
- [x] Inspect backend structure
- [x] Inspect frontend structure
- [x] Inspect mobile structure
- [x] Identify current modules for locations, assets, requests, work orders, PM, maps, and public portal
- [x] Identify current DTOs, entities, routes, services, and UI screens relevant to the project
- [x] Identify where status is currently represented
- [x] Identify where request approval and work order conversion happen
- [x] Summarize reusable parts and probable gaps
- [x] Create project memory docs

## Phase 1 - Business Model Alignment
- [x] Confirm `TrafficLightPoint -> Location` mapping
- [x] Confirm `main equipment -> Asset` mapping
- [x] Decide MVP persistence shape:
  - [x] use `TrafficLightPoint` extension entity
  - [x] do not extend `Location` directly for all traffic-light metadata
- [x] Decide QR metadata persistence shape
- [x] Define field-level mapping
- [x] Define status derivation rules
- [x] Define traffic-light request metadata
- [x] Document risks and tradeoffs

## Phase 2 - Backend QR Support
- [x] Design QR resolve endpoint
- [x] Design point-by-QR service lookup
- [x] Reuse request creation flow
- [x] Add request metadata support if needed
- [x] Define migrations and indexes
- [x] Define backend test cases
- [x] Implement public QR resolve endpoint
- [x] Implement public QR request create endpoint
- [x] Centralize request creation side effects for portal and QR flows
- [x] Verify backend compile and focused unit tests

## Phase 3 - Frontend QR Flow
- [x] Re-read project memory before Phase 3 implementation
- [x] Design public route structure
- [x] Build QR landing page
- [x] Build QR request page
- [x] Build confirmation page
- [x] Verify loading, error, empty, and success states

## Phase 4 - Admin Review
- [x] Add traffic-light context to request list
- [x] Add traffic-light context to request detail
- [x] Verify approval and rejection paths
- [x] Verify work order creation result

## Phase 5 - Map and Status
- [x] Define marker status model
- [x] Define traffic-light map data API
- [x] Add status filters and point detail navigation
- [x] Review large-data rendering approach

## Phase 6 - PM and History
- [x] Map PM to point or main asset
- [x] Compute next maintenance
- [x] Expose point history
- [x] Integrate PM into point operational status

## Phase 7 - Hardening
- [x] Review DB indexes
- [x] Review QR lookup performance
- [x] Review map loading performance
- [x] Review request flow permissions
- [x] Review duplicate-request handling
- [x] Build regression checklist

## Post-Phase Localization Maintenance
- [x] Inspect frontend and backend language setting flow
- [x] Fix Traditional Chinese settings selection mismatch
- [x] Centralize lazy-loaded language switching in the frontend
- [x] Add Vietnamese locale registration and translation bundle
- [x] Backfill missing Traditional Chinese translation keys
- [x] Verify locale coverage, targeted lint, and production build
- [x] Fix stale Settings dropdown value for `vi` and `zh_tw`
- [x] Add mobile language options with lower-case i18n codes and backend-code mapping
- [x] Add mobile Settings language picker with immediate UI switch
- [x] Respect missing mobile `SETTINGS` permission by keeping language changes local-only
- [x] Add bundled mobile `vi` and `zh_tw` translation files
- [x] Verify mobile formatting and TypeScript compile
- [x] Inspect mobile login, register, and custom-server startup flow on physical-device issues
- [x] Guard mobile runtime against missing default `API_URL`
- [x] Surface backend and config errors in mobile login and register screens

## Snapshot
- Completed:
  - Phases 0, 1, 2, 3, 4, 5, 6, and 7
  - post-phase localization maintenance
- In progress:
  - none
- Pending:
  - manual localization QA and terminology review
  - mobile device or simulator validation for the language picker flow
  - mobile physical-device validation for login, register, and `Custom Server` against a reachable backend
