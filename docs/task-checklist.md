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
- [x] Bring local backend up successfully for mobile testing
- [x] Diagnose Android physical-device `Custom Server` bundle failure through ADB and logcat
- [x] Remove lazy-loaded `CustomServer` screen to avoid Windows split-bundle path errors
- [x] Normalize mobile custom-server URLs and prevent keyboard auto-capitalization on the URL field
- [x] Improve mobile network error diagnostics with request destination details
- [x] Make the shared mobile action-sheet option list scrollable for long pickers such as language selection

## Post-Phase Mobile Scan Follow-Up
- [x] Inspect the mobile scan flow and identify the active license gate for barcode or QR scanning
- [x] Remove the legacy license check from the mobile barcode or QR entry path while preserving the NFC gate
- [x] Remove the matching backend `/assets/barcode` license gate so the scan flow succeeds end to end
- [x] Verify backend compile and mobile formatting after the scan follow-up change

## Post-Phase Mobile Scan Lifecycle Follow-Up
- [x] Inspect the dedicated mobile `Scan` screen and the barcode modal reopen lifecycle
- [x] Remove NFC from the dedicated mobile `Scan` screen
- [x] Make the barcode modal reset and remount the camera on focus so repeated opens stay usable
- [x] Verify mobile formatting after the scan lifecycle change

## Post-Phase Location Traffic-Light Automation
- [x] Re-read project memory and confirm the project stays on the point-centric QR model
- [x] Identify the minimal marker needed to tell whether a location should auto-provision traffic-light data
- [x] Add a `trafficLightEnabled` flag on `Location` and backfill it for existing traffic-light locations
- [x] Auto-create `TrafficLightPoint` when a traffic-light location is created or first enabled
- [x] Auto-create an active `QrTag.qrPublicCode` for new traffic-light points
- [x] Preserve the traffic-light flag when a point already exists to avoid orphaned point state
- [x] Expose the active QR public code in the location traffic-light detail DTO
- [x] Render the QR code in the existing traffic-light location detail panel
- [x] Verify focused backend tests, backend compile, frontend lint, and frontend build

## Snapshot
- Completed:
  - Phases 0, 1, 2, 3, 4, 5, 6, and 7
  - post-phase localization maintenance
  - post-phase mobile scan follow-up
  - post-phase mobile scan lifecycle follow-up
  - post-phase location traffic-light automation follow-up
- In progress:
  - none
- Pending:
  - manual web validation that a new traffic-light location auto-creates its `TrafficLightPoint` and QR code
  - manual web validation that toggling an existing non-traffic-light location on creates the point and QR code
  - manual web validation that the QR shown in location detail resolves to the public traffic-light route
  - manual localization QA and terminology review
  - mobile device or simulator validation for the language picker flow
  - mobile physical-device validation for login, register, and `Custom Server` against the running local backend
  - mobile physical-device validation that login and register succeed end to end with the current USB reverse or LAN backend setup
  - mobile physical-device validation that barcode or QR scanning now opens without a license and keeps the camera preview working on repeated opens
