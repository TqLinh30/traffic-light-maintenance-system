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

## Post-Phase Mobile Traffic-Light Location Parity
- [x] Inspect mobile location create, edit, and detail flows against the accepted point-centric traffic-light model
- [x] Add `trafficLightEnabled` to the mobile location form model and create or edit screens
- [x] Fetch traffic-light point detail from mobile location detail
- [x] Expose a mobile QR section for traffic-light locations
- [x] Add a backend-provided public QR URL to the traffic-light detail DTO so mobile can render a scannable QR target
- [x] Verify focused backend tests, backend compile, and mobile typecheck impact

## Post-Phase Web Location Map Picker Hardening
- [x] Inspect the web `Location` add and edit form map-picker implementation
- [x] Confirm why the picker resets after click and why address input never recenters the map
- [x] Keep the existing `Location` map UI but make the picker state controlled during selection
- [x] Geocode the `address` field into `coordinates` for the picker
- [x] Add reverse-geocoded click confirmation with an explicit `OK` action before replacing the form `address`
- [x] Add a direct search field inside `Map Coordinates`
- [x] Default the select-mode map picker to Taiwan and bias explicit searches toward Taiwan
- [x] Fix explicit search propagation through the shared `Map` wrapper and add Places-based fallbacks for search and click labeling
- [x] Intercept POI clicks so named places use the app popup with `OK` instead of the default Google card
- [x] Separate named-POI fallback from generic feature clicks and prefer broader reverse-geocode results over sticky nearest-rooftop addresses
- [x] Enrich degraded POI fallback with a short-range nearby-place title lookup before dropping to address-only popup content
- [x] Stabilize search-result and post-search POI popup lifecycle so parent rerenders do not immediately clear the map picker preview
- [x] Move `Put location in map` and the map picker directly below the `address` field in the web `Location` form
- [x] Verify frontend formatting, targeted lint, and frontend build

## Post-Phase Local Backend Startup Recovery
- [x] Inspect the local Spring Boot startup failures after switching back to a native PostgreSQL install
- [x] Identify the required non-empty env placeholders needed for `.\mvnw.cmd spring-boot:run`
- [x] Remove the traffic-light service and mapper bean cycle that blocked Spring context startup
- [x] Verify backend compile after the cycle fix
- [x] Verify local backend startup on `localhost:8080` with the current native PostgreSQL `atlas` database

## Post-Phase SignalCare Branding Rollout
- [x] Re-read project memory and inspect the current default branding surfaces across backend, web, home, and mobile
- [x] Replace the default product name with `SignalCare` in the main user-facing metadata and copy
- [x] Replace the default logo assets across `frontend`, `home`, backend email assets, and mobile app assets
- [x] Replace the earlier generated `SignalCare` logo with the approved user-provided SVG source and regenerate branded assets from that vector
- [x] Refresh the web sidebar from the old dark hardcoded styling to a light modern theme-driven palette
- [x] Keep risky technical identifiers unchanged for now and document that decision
- [x] Run targeted compile, build, lint, and config checks for the branding rollout and document any pre-existing blockers
- [ ] Manually validate the updated branded entry points across web, home, and mobile after the targeted automated checks

## Snapshot
- Completed:
  - Phases 0, 1, 2, 3, 4, 5, 6, and 7
  - post-phase localization maintenance
  - post-phase mobile scan follow-up
  - post-phase mobile scan lifecycle follow-up
  - post-phase location traffic-light automation follow-up
  - post-phase SignalCare branding rollout implementation
- In progress:
  - none
- Pending:
  - manual QA that the default `SignalCare` name and refreshed SVG-derived logo render correctly on the main web, home, backend email, and mobile entry points
  - manual QA that the refreshed web sidebar looks correct in desktop and mobile drawer layouts with the new light modern palette
  - manual end-to-end local web demo validation with `frontend`, native PostgreSQL, and MinIO against the recovered backend startup path
  - manual web validation that a new traffic-light location auto-creates its `TrafficLightPoint` and QR code
  - manual web validation that toggling an existing non-traffic-light location on creates the point and QR code
  - manual web validation that the QR shown in location detail resolves to the public traffic-light route
  - manual web validation that the location map picker supports internal search, recenters to Taiwan-biased results, keeps the clicked marker stable, and updates `address` only after the popup `OK` action
  - Google Cloud project update for the current `GOOGLE_KEY` so `Geocoding API` and the required `Places` services stop returning `REQUEST_DENIED` in the web map picker
  - mobile manual validation that a newly created traffic-light location now shows the QR section in location detail
  - mobile manual validation that an older location created before the mobile fix can be edited to enable `trafficLightEnabled` and provision its QR
  - manual localization QA and terminology review
  - mobile device or simulator validation for the language picker flow
  - mobile physical-device validation for login, register, and `Custom Server` against the running local backend
  - mobile physical-device validation that login and register succeed end to end with the current USB reverse or LAN backend setup
  - mobile physical-device validation that barcode or QR scanning now opens without a license and keeps the camera preview working on repeated opens
