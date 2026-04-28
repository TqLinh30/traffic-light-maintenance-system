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

## Post-Phase Web Traffic-Light Location Create UX
- [x] Re-read project memory and inspect the current web `Location` create flow, map picker, and image upload behavior
- [x] Replace the optional create-form map toggle with an always-visible map picker in the web `Add Location` modal
- [x] Add a Street View preview directly below the map picker in the web `Add Location` modal
- [x] Reuse the create-form image upload field and fall back to the current Street View preview when no image is uploaded
- [x] Automatically submit `trafficLightEnabled=true` for new web locations created from the `Add Location` modal
- [x] Verify frontend formatting, targeted lint, and production build for the create-flow update

## Post-Phase Web Location Create Follow-Up
- [x] Prevent the web map picker `OK` confirmation from re-geocoding the address and changing the selected coordinates
- [x] Upgrade the web `Add Location` Street View preview from a static image to an interactive panorama that supports looking around and following available navigation
- [x] Verify frontend formatting, targeted lint, and production build for the create follow-up

## Post-Phase Traffic-Light Pole Detail Surface
- [x] Re-read project memory and inspect the current web location detail drawer, traffic-light DTOs, and create-location flow
- [x] Persist traffic-light installation date, expected warranty date, and manual maintenance-history notes on `TrafficLightPoint`
- [x] Route the web `Add Location` modal through the backend create path with the new pole-metadata fields
- [x] Replace the assets-first location detail tab with a traffic-light information surface for traffic-light-enabled locations
- [x] Verify backend compile, focused backend test, frontend formatting, targeted lint, and production build for the pole-detail update

## Post-Phase Auto Image License Follow-Up
- [x] Inspect why the web traffic-light location create flow shows a file-license error while still creating the location
- [x] Move the Street View fallback image off the manual file-upload path and into the backend location-create flow
- [x] Verify backend compile, focused backend test, frontend formatting, targeted lint, and production build for the auto-image follow-up

## Post-Phase Live Runtime Sync
- [x] Identify which database instance the running local backend is actually using
- [x] Confirm whether the live runtime has applied `2026_04_25_1777100000_traffic_light_point_metadata.xml`
- [x] Rebuild and restart the live local backend against the active PostgreSQL instance on `localhost:5434`
- [x] Verify the live schema now contains `expectedWarrantyDate` and `maintenanceHistory`
- [x] Verify the existing sample location `test04` was created before the runtime sync and still has `NULL` image and lifecycle metadata values

## Post-Phase Traffic-Light Edit And QR Detail Parity
- [x] Re-read project memory and inspect the current web location edit modal plus public QR detail surface
- [x] Reuse the dedicated traffic-light add form for traffic-light location edits while keeping a safe fallback for legacy non-traffic-light locations
- [x] Extend the location patch flow so edit can repair missing traffic-light lifecycle fields and attach a generated fallback image when the location still has no image
- [x] Expose signed location image URLs on the public traffic-light point DTO
- [x] Refresh the public QR landing page so it surfaces the pole image and lifecycle metadata alongside the existing status and active-work-order context
- [x] Verify backend compile, targeted frontend lint, frontend build, and live backend restart for the edit and QR detail parity pass

## Post-Phase Mobile Traffic-Light Form And Detail Parity
- [x] Re-read project memory and inspect the current mobile location create, edit, and detail flows against the latest web traffic-light UX
- [x] Replace the mobile create screen with a dedicated traffic-light form that captures coordinates, image, installation date, expected warranty date, and maintenance history
- [x] Reuse the dedicated traffic-light form for mobile edits while keeping the generic edit form as a safe fallback for legacy non-traffic-light locations
- [x] Add a keyless mobile map picker path that writes selected coordinates into the form and provides Street View plus Google Maps launch actions from the chosen point
- [x] Upgrade the mobile traffic-light detail tab so it shows pole image, lifecycle dates, maintenance notes, work-order history, PM summary, and QR actions instead of the earlier QR-only panel
- [x] Verify mobile formatting and mobile typecheck impact for the traffic-light form and detail parity pass

## Post-Phase Mobile Web Bundling Recovery
- [x] Re-read project memory and inspect the mobile web bundling failure caused by `react-native-image-viewing`
- [x] Confirm the vendor package is missing a web-resolvable `ImageItem` entry point
- [x] Add a safe `patch-package` shim so web bundling can resolve `ImageItem.web.js` without changing native behavior
- [x] Verify the mobile web bundle succeeds again with `npx expo export --platform web`

## Post-Phase Mobile Google Maps Activation
- [x] Re-read project memory and inspect the current mobile traffic-light map picker against the accepted web Google Maps workflow
- [x] Confirm the mobile picker is still using `Leaflet + OpenStreetMap + Nominatim` inside a `WebView`
- [x] Upgrade the mobile picker to prefer Google Maps JS search, pin placement, drag-to-adjust, and reverse geocoding when a `GOOGLE_KEY` is available
- [x] Add an inline mobile Street View preview so operators can inspect the selected pole similarly to the web create or edit flow
- [x] Preserve a safe OpenStreetMap fallback path when `GOOGLE_KEY` is absent from the mobile runtime
- [x] Expose `GOOGLE_KEY` through mobile Expo config so the picker can read it from runtime config as well as inline environment variables
- [x] Verify mobile formatting, mobile web export, and mobile typecheck impact for the Google Maps activation pass

## Post-Phase Web Location Image Recovery
- [x] Re-read project memory and inspect why the web traffic-light location detail tab stopped showing the pole image
- [x] Confirm the traffic-light detail tab still used `location.image.url` while the dedicated traffic-light detail DTO already exposed `point.locationImageUrl`
- [x] Update the web traffic-light detail tab to prefer the fresh `point.locationImageUrl` value and fall back to the older location payload only when needed
- [x] Update the traffic-light edit modal image preview to use the same fresh signed image source
- [x] Verify formatting, targeted lint, and frontend build impact for the web location image recovery pass

## Post-Phase Local MinIO Image Runtime Recovery
- [x] Re-read project memory and inspect why the web still showed a broken image icon after the UI wiring fix
- [x] Confirm the location row really has an `image_id` in PostgreSQL and the image object still exists in the MinIO bucket
- [x] Reproduce that local presigned URLs signed against `http://localhost:9000` reset connection in standard HTTP clients while the same object loads when signed against `http://127.0.0.1:9000`
- [x] Update local dev MinIO public-endpoint defaults from `localhost` to `127.0.0.1` in tracked config
- [x] Restart the live backend on `localhost:8080` with the corrected MinIO endpoint so newly issued signed image URLs use the working host

## Post-Phase Web Street View To Map Sync
- [x] Re-read project memory and inspect why moving along Street View does not move the selected map point
- [x] Confirm the web traffic-light form currently only drives Street View from the map and not the reverse direction
- [x] Track Street View `position_changed` updates separately from the saved traffic-light coordinates so the panorama camera can move without dragging the selected pole point onto the roadway
- [x] Surface the moving Street View camera back on the map and panorama without causing the panorama to reload itself in a loop
- [x] Capture the current Street View position, heading, pitch, and zoom so fallback pole images use the operator's active panorama view instead of the initial default framing
- [x] Verify frontend formatting, targeted lint, and production build for the Street View sync follow-up

## Post-Phase Web Location Modal White-Screen Recovery
- [x] Re-read project memory and inspect the new white-screen regression in the dedicated web traffic-light add and edit modals
- [x] Confirm the dedicated form now crashes on mount because `StreetViewPreview` re-runs its effect whenever callback props change and immediately writes back into Formik through `onCaptureChange`
- [x] Stabilize the Street View callback flow with refs so mount-time `onCaptureChange(null)` and later Street View events do not recursively retrigger the same effect
- [x] Verify frontend formatting, targeted lint, production build, and a standalone render harness for the modal recovery pass

## Post-Phase Web Street View Google-Style Marker Sync
- [x] Re-read project memory and inspect the current web Street View-to-map synchronization behavior
- [x] Remove the separate blue Street View camera marker and distance connector from the map picker
- [x] Drive the selected red map marker and popup coordinates from the active Street View panorama position
- [x] Render the selected marker with the current Street View heading so the direction matches the operator's view
- [x] Preserve the user's current map zoom when Street View movement pans the map marker
- [x] Keep loop protection so writing Street View coordinates back into Formik does not reload the panorama or blank the modal
- [x] Verify frontend formatting, targeted lint, and production build for the Google-style marker sync pass

## Post-Phase Web Map Picker Persistent Address Panel
- [x] Re-read project memory and inspect the map picker address-preview lifecycle after the Google-style Street View marker sync
- [x] Confirm Street View coordinate updates can make the original map-click reverse-geocode result stale, leaving only a coordinate fallback in the preview
- [x] Re-resolve the address whenever the current selected coordinates change from Street View movement or initial selected values
- [x] Replace the closeable select-mode map `InfoWindow` with a persistent lower-left panel
- [x] Keep the `OK` address-confirm action visible after confirmation instead of closing the preview panel
- [x] Verify frontend formatting, targeted lint, and production build for the persistent address panel pass

## Post-Phase Unlimited Location Quota And Delete Recovery
- [x] Re-read project memory and inspect backend location create, import, and delete flows
- [x] Confirm the old license quota guard capped non-licensed location creation at 10 through `UNLIMITED_LOCATIONS`
- [x] Remove the usage-based location quota from manual create and import flows
- [x] Confirm traffic-light location deletion can be blocked by QR/TrafficLightPoint foreign keys when cascade behavior is missing
- [x] Clean up traffic-light point and QR records before deleting a location
- [x] Add a migration that changes traffic-light point and QR foreign keys to `ON DELETE CASCADE`
- [x] Verify focused backend tests for location create and delete behavior

## Post-Phase Web Location Mutation Refresh And Street View Edit Image
- [x] Re-read project memory and inspect the web delete, edit, Redux location slice, and backend update image flow
- [x] Confirm the stale delete/edit behavior came from updating the flat `locations` slice but not `locationsHierarchy`
- [x] Update Redux location reducers so add, edit, and delete keep hierarchy and mini read models in sync
- [x] Refresh loaded web location views after create, edit, and delete mutations
- [x] Confirm traffic-light edit only generated a Street View fallback image when the location had no existing image
- [x] Allow traffic-light edit to replace an existing image with the current generated Street View image when no manual image is uploaded
- [x] Verify focused backend tests, frontend targeted lint, diff check, and frontend production build

## Post-Phase Web Street View Edit Image Fetch Recovery
- [x] Re-read project memory and inspect the failed web edit-image save behavior
- [x] Confirm the frontend generated-image path depended on browser `fetch()` of a Google Street View Static image URL
- [x] Replace browser-side image fetching with a backend-downloaded `generatedImageSourceUrl` payload
- [x] Restrict backend generated-image downloads to Google Street View Static URLs
- [x] Stop forcing the traffic-light map refresh after list create/edit/delete when the operator is not viewing that map
- [x] Verify focused backend tests, frontend targeted lint, diff check, and frontend production build

## Post-Phase Local MinIO Signed URL Runtime Hardening
- [x] Re-read project memory and inspect why traffic-light location images still rendered as broken after a backend restart
- [x] Confirm the latest traffic-light locations have `image_id` values and matching MinIO objects
- [x] Confirm the live public QR DTO was still returning signed image URLs with `http://localhost:9000`
- [x] Confirm those `localhost:9000` signed URLs reset the local HTTP connection while the object exists
- [x] Normalize stale local MinIO public endpoints from `localhost` to `127.0.0.1` inside backend signing setup
- [x] Restart the live backend with the corrected code and local env
- [x] Verify a public QR response now returns a `127.0.0.1:9000` image URL that downloads as `200 image/jpeg`

## Post-Phase Web Detail Drawer Refresh After Edit
- [x] Re-read project memory and inspect why an already-open traffic-light location detail drawer kept the old image after edit save
- [x] Confirm the drawer's traffic-light detail fetch only reran for location id or traffic-light flag changes
- [x] Add a parent-driven refresh key that increments after successful location edit saves
- [x] Make `LocationDetails` refetch traffic-light point details when the refresh key changes
- [x] Verify targeted frontend lint and production build

## Snapshot
- Completed:
  - Phases 0, 1, 2, 3, 4, 5, 6, and 7
  - post-phase localization maintenance
  - post-phase mobile scan follow-up
  - post-phase mobile scan lifecycle follow-up
  - post-phase location traffic-light automation follow-up
  - post-phase SignalCare branding rollout implementation
  - post-phase web traffic-light location create UX implementation
  - post-phase web location create follow-up
  - post-phase traffic-light pole detail surface
  - post-phase auto image license follow-up
  - post-phase live runtime sync
  - post-phase traffic-light edit and QR detail parity
  - post-phase mobile traffic-light form and detail parity
  - post-phase mobile web bundling recovery
  - post-phase web location image recovery
  - post-phase local MinIO image runtime recovery
  - post-phase web Street View to map sync
  - post-phase web location modal white-screen recovery
  - post-phase web Street View Google-style marker sync
  - post-phase web map picker persistent address panel
  - post-phase unlimited location quota and delete recovery
  - post-phase web location mutation refresh and Street View edit image
  - post-phase web Street View edit image fetch recovery
  - post-phase local MinIO signed URL runtime hardening
  - post-phase web detail drawer refresh after edit
- In progress:
  - none
- Pending:
  - manual QA that the default `SignalCare` name and refreshed SVG-derived logo render correctly on the main web, home, backend email, and mobile entry points
  - manual QA that the refreshed web sidebar looks correct in desktop and mobile drawer layouts with the new light modern palette
  - manual end-to-end local web demo validation with `frontend`, native PostgreSQL, and MinIO against the recovered backend startup path
  - manual web validation that a new traffic-light location auto-creates its `TrafficLightPoint` and QR code
  - manual web validation that adding the 11th and later locations succeeds without a license quota error
  - manual web validation that deleting traffic-light locations succeeds, no longer fails from QR or point foreign-key references, and immediately removes the row from the visible list without a manual refresh
  - manual web validation that the new `Add Location` modal always shows the map and Street View preview in the intended order, keeps the confirmed selected coordinates after `OK`, and writes those coordinates into persisted `latitude` and `longitude`
  - manual web validation that the new `Add Location` modal persists `installationDate`, `expectedWarrantyDate`, and optional `maintenanceHistory` onto the auto-created traffic-light point
  - manual web validation that leaving the image upload empty now uses the current Street View preview as the default image without showing the old file-license error when Google can return Street View imagery for the selected point
  - manual web validation that the new interactive Street View panorama allows looking around and following available nearby navigation while the single red directional map marker follows the active Street View position
  - manual web validation that the persistent lower-left map panel resolves an address after map clicks and Street View movement, keeps the `OK` address-confirm action visible, and never shows the old closeable map popup
  - manual web validation that the auto-generated fallback image now respects the operator's active Street View heading, pitch, and zoom at submit time
  - manual web validation that the new traffic-light edit modal preloads existing name, address, coordinates, image, and lifecycle data, can replace the saved image from the current Street View framing without browser `Failed to fetch` errors, refreshes the visible list and the already-open detail drawer after save, and can repair older rows such as `test04`
  - manual web validation that the first location-detail tab now shows traffic-light image, lifecycle dates, manual notes, PM schedules, work-order history, and QR actions instead of the old assets list
  - manual web validation that the traffic-light detail tab and edit modal image preview now resolve from the fresh signed `point.locationImageUrl` returned by the dedicated detail endpoint
  - manual web hard-refresh validation that existing browser state no longer holds stale `localhost:9000` image URLs and the detail drawer now displays the freshly issued `127.0.0.1:9000` image URLs
  - recreate or repair any sample locations, such as `test04`, that were created before the 2026-04-25 live backend restart and therefore still have `NULL` image or lifecycle metadata
  - manual web validation that toggling an existing non-traffic-light location on creates the point and QR code
  - manual web validation that the QR shown in location detail resolves to the public traffic-light route
  - manual web validation that the public QR landing page now shows pole image and lifecycle metadata correctly for a location that already has those values
  - manual web validation that the location map picker supports internal search, recenters to Taiwan-biased results, keeps the clicked marker stable, and updates `address` only after the popup `OK` action
  - Google Cloud project update for the current `GOOGLE_KEY` so `Geocoding API` and the required `Places` services stop returning `REQUEST_DENIED` in the web map picker
  - mobile manual validation that a newly created traffic-light location now shows the dedicated pole detail tab with image, lifecycle data, PM summary, work-order history, and QR actions
  - mobile manual validation that the new mobile map picker keeps the selected coordinates stable and updates the address sensibly after map clicks and Taiwan-biased searches
  - mobile manual validation that an older traffic-light location such as `test04` can be repaired through the new mobile edit form and then shows the updated image and lifecycle data in detail
  - mobile manual validation that the `Tasks` image-viewer zoom flow still works on native and web after the `react-native-image-viewing` web shim
  - manual localization QA and terminology review
  - mobile device or simulator validation for the language picker flow
  - mobile physical-device validation for login, register, and `Custom Server` against the running local backend
  - mobile physical-device validation that login and register succeed end to end with the current USB reverse or LAN backend setup
  - mobile physical-device validation that barcode or QR scanning now opens without a license and keeps the camera preview working on repeated opens
