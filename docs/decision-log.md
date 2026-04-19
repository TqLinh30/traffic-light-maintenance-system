# Decision Log

## 2026-04-12 - Phase 0 Discovery Decisions

### D-001
- Decision:
  - Treat one traffic light point as primarily a place-level object, not an equipment object.
- Status:
  - provisional, to be finalized in Phase 1
- Rationale:
  - Atlas `Location` already carries coordinates and is the natural anchor for map, request, work order, and PM linkage.

### D-002
- Decision:
  - Treat attached traffic light hardware as secondary equipment mapped to `Asset`.
- Status:
  - provisional
- Rationale:
  - Existing `Asset` model already supports barcode or NFC, status, downtime, and location linkage.

### D-003
- Decision:
  - Do not overload asset barcode lookup as the public QR solution.
- Status:
  - provisional
- Rationale:
  - Current barcode and NFC flow is authenticated, internal, and asset-centric.
  - Traffic light QR needs public resolution, QR lifecycle, and point-centric behavior.

### D-004
- Decision:
  - Reuse Atlas request approval flow instead of building a new approval system.
- Status:
  - accepted
- Evidence:
  - `RequestController.approve(...)` already creates work orders through `RequestService.createWorkOrderFromRequest(...)`.

### D-005
- Decision:
  - Reuse Atlas public request portal concepts where helpful, but create a dedicated QR route and resolver.
- Status:
  - provisional
- Rationale:
  - Existing portal route is UUID-based and configuration-driven.
  - Traffic-light QR flow needs direct `qrPublicCode -> point` resolution.

### D-006
- Decision:
  - Prefer derived traffic-light operational status over manually duplicated state.
- Status:
  - provisional
- Rationale:
  - Atlas already has request, work order, PM, and asset state signals we can combine.

## 2026-04-12 - Phase 1 Business Model Alignment Decisions

### D-007
- Decision:
  - `TrafficLightPoint` will be implemented as a thin extension entity linked one-to-one to `Location`.
- Status:
  - accepted
- Rationale:
  - preserves Atlas `Location` as the canonical map object while isolating traffic-light-specific metadata.

### D-008
- Decision:
  - `Location` remains the canonical source for point `name`, `address`, `latitude`, and `longitude`.
- Status:
  - accepted
- Rationale:
  - avoids duplicating mutable place data into traffic-light tables.

### D-009
- Decision:
  - `TrafficLightPoint.mainAsset` maps the primary equipment to `Asset`.
- Status:
  - accepted
- Rationale:
  - keeps equipment secondary to the point while reusing Atlas asset capabilities.

### D-010
- Decision:
  - `QrTag` will be a dedicated entity with public-code lookup and lifecycle status.
- Status:
  - accepted
- Rationale:
  - asset barcode support is not an appropriate public QR abstraction.

### D-011
- Decision:
  - traffic-light operational status will be computed server-side and exposed through DTOs, not stored as a persisted source of truth.
- Status:
  - accepted
- Rationale:
  - prevents drift between requests, work orders, PMs, and any cached point status.

### D-012
- Decision:
  - request metadata for QR flow will be stored directly on `Request` using additive nullable fields.
- Status:
  - accepted
- Rationale:
  - keeps the issue intake audit trail close to the request while reusing the existing approval flow.

### D-013
- Decision:
  - MVP due-soon status window will use `min(7 days, max(1 day, maintenanceCycleDays * 0.2))`.
- Status:
  - accepted
- Rationale:
  - provides a stable default without introducing extra configuration during the first pass.

## 2026-04-12 - Phase 2 Backend QR Decisions

### D-014
- Decision:
  - add dedicated public QR endpoints under `/traffic-light-qr/**` instead of routing QR traffic through the generic request portal endpoints.
- Status:
  - accepted
- Rationale:
  - QR lookup is code-based and point-specific, while request portals are UUID-based and configuration-driven.

### D-015
- Decision:
  - reuse the existing `RequestService.create(...)` path and centralize request side effects in `RequestLifecycleService`.
- Status:
  - accepted
- Rationale:
  - prevents QR-specific duplication of notifications and keeps portal and internal request flows aligned.

### D-016
- Decision:
  - keep duplicate-request prevention out of the first backend slice and defer it to hardening unless a low-risk rule emerges from real request behavior.
- Status:
  - accepted
- Rationale:
  - any early deduplication rule risks hiding real incidents without enough operational evidence.

## 2026-04-12 - Phase 3 Frontend QR Decisions

### D-017
- Decision:
  - use dedicated public frontend routes under `/traffic-light/:qrPublicCode` instead of reusing the existing request portal UI route.
- Status:
  - accepted
- Rationale:
  - the QR flow starts from point resolution, not from portal configuration, and needs point status plus active-task context on first load.

### D-018
- Decision:
  - keep the public QR page state local to the page and shared browser storage instead of introducing a new Redux slice in Phase 3.
- Status:
  - accepted
- Rationale:
  - the flow is currently isolated to one public page and does not justify broader store surface yet.

### D-019
- Decision:
  - capture browser geolocation for QR submissions on a best-effort basis without blocking request submission.
- Status:
  - accepted
- Rationale:
  - scan location is useful audit data, but public issue reporting must still work when the browser denies or lacks location access.

## 2026-04-12 - Phase 4 Admin Review Decisions

### D-020
- Decision:
  - surface traffic-light request metadata directly in the existing request list and request detail drawer instead of introducing a separate traffic-light admin screen.
- Status:
  - accepted
- Rationale:
  - Atlas already has a functioning review and approval surface, and the new metadata is additive rather than structurally different.

### D-021
- Decision:
  - keep the new traffic-light request columns non-sortable in the request list for now.
- Status:
  - accepted
- Rationale:
  - this avoids coupling the frontend list change to unverified backend search sorting support for new or nested fields during the review phase.

## 2026-04-12 - Phase 5 Map And Status Decisions

### D-022
- Decision:
  - expose traffic-light operational map data through a dedicated internal summary endpoint instead of extending the generic location map endpoint.
- Status:
  - accepted
- Rationale:
  - traffic-light status is derived and domain-specific, while the generic location map should remain stable for non-traffic-light usage.

### D-023
- Decision:
  - add the operational traffic-light map as a dedicated tab within the existing locations screen instead of replacing the generic map tab.
- Status:
  - accepted
- Rationale:
  - keeps the location module familiar for users, preserves current behavior, and limits the new surface area to an additive tab.

### D-024
- Decision:
  - keep map marker drill-in on the existing location detail drawer for Phase 5.
- Status:
  - accepted
- Rationale:
  - one traffic-light point is already anchored to one location, so location detail remains the smallest safe drill-in surface until a richer point detail view is justified.

## 2026-04-12 - Phase 6 PM And History Decisions

### D-025
- Decision:
  - implement the first traffic-light point-detail surface inside the existing location drawer instead of creating a new standalone point-detail route.
- Status:
  - accepted
- Rationale:
  - preserves the location-first operating model and keeps the PM/history enhancement additive.

### D-026
- Decision:
  - derive `nextMaintenanceAt` from the earliest related PM next-work-order date when present, with maintenance-cycle fallback when PM data is absent.
- Status:
  - accepted
- Rationale:
  - reuses Atlas scheduling logic where it exists without breaking existing cycle-based behavior for points that do not yet have PM schedules.

## 2026-04-12 - Phase 7 Hardening Decisions

### D-027
- Decision:
  - optimize the traffic-light map endpoint with batched repository reads instead of per-point work-order, PM, and pending-request lookups.
- Status:
  - accepted
- Rationale:
  - this is the highest-value performance fix in the current MVP because map loading touches many points at once.

### D-028
- Decision:
  - keep duplicate-request handling review-only in this pass and avoid automatic suppression rules for now.
- Status:
  - accepted
- Rationale:
  - the current product lacks enough operational evidence to distinguish harmful duplicates from legitimate repeated incidents at the same point.

## 2026-04-13 - Post-Phase Localization Decisions

### D-029
- Decision:
  - route all frontend language changes through one shared lazy-loading helper instead of calling `i18n.changeLanguage(...)` directly from screens or auth bootstrap.
- Status:
  - accepted
- Rationale:
  - the app uses on-demand translation bundle loading, so direct `changeLanguage(...)` calls can leave UI state and loaded resources out of sync.
  - this also prevents persisted company language values from diverging from the language shown in settings.

### D-030
- Decision:
  - add Vietnamese as a first-class supported frontend locale and complete `zh_tw` key coverage to match the current `en` translation set.
- Status:
  - accepted
- Rationale:
  - the project now needs Vietnamese support, and Traditional Chinese had enough missing keys to leave significant English fallback in the UI.

### D-031
- Decision:
  - keep the General Settings language control outside Formik `Field` wiring and use a directly controlled `Select` with `enableReinitialize`.
- Status:
  - accepted
- Rationale:
  - the language dropdown can change app-wide i18n state immediately, so keeping it on stale Formik initial state caused the selected label to remain `English` even after the UI language changed.

### D-032
- Decision:
  - render the General Settings language select from `i18n.language` instead of the persisted general-preferences value during language switches.
- Status:
  - accepted
- Rationale:
  - `vi` and `zh_tw` are lazy-loaded the first time they are selected, and the select should reflect the language the app is actively using even while the persisted settings update is still settling.

### D-033
- Decision:
  - drive mobile language selection from one shared lower-case locale registry and only persist the backend language code when the user has `SETTINGS` permission.
- Status:
  - accepted
- Rationale:
  - mobile needs one source of truth for `en` / `pt_br` / `zh_tw` style runtime codes versus backend enum values like `EN` / `PT_BR` / `ZH_TW`.
  - local-only fallback avoids avoidable `403` errors for users who can access the mobile settings screen but cannot edit company settings.

### D-034
- Decision:
  - fail mobile auth requests with an explicit configuration error when neither `API_URL` nor `customApiUrl` is available, and surface the real backend or config message in login and register UI.
- Status:
  - accepted
- Rationale:
  - physical-device testing showed that the old flow collapsed missing-server, network, and credential problems into the same generic `wrong_credentials` snackbar, which made first-run setup unnecessarily hard to diagnose.

### D-035
- Decision:
  - use a dedicated Docker PostgreSQL instance exposed on local port `5433` for backend startup on this workstation because the host already runs a native PostgreSQL service on `5432`.
- Status:
  - superseded
- Rationale:
  - backend startup succeeded only after avoiding the host-level PostgreSQL port collision and pointing `DB_URL` to the dedicated project database.

### D-036
- Decision:
  - treat the mobile `Custom Server` setting and the Expo development bundle server as two separate runtime dependencies during physical-device testing.
- Status:
  - accepted
- Rationale:
  - `mobile/screens/auth/CustomServerScreen.tsx` only stores the API base URL in `AsyncStorage`; it does not control Metro or Expo dev-client bundle loading.
  - when using the `development` profile from `mobile/eas.json`, the device must reach both the backend API on `8080` and Metro on `8081`.

### D-037
- Decision:
  - avoid `React.lazy(...)` for the mobile `CustomServer` auth screen and use a static import instead.
- Status:
  - accepted
- Rationale:
  - Android physical-device logcat showed Expo dev client requesting a lazy split bundle at `screens\\auth\\CustomServerScreen.bundle`, which contains Windows path separators and fails to load.
  - other auth screens already use static imports, so this is the smallest safe fix for the device-only bundle failure.

### D-038
- Decision:
  - normalize mobile custom-server URLs to a lowercase scheme and disable auto-capitalization or correction on the URL input field.
- Status:
  - accepted
- Rationale:
  - physical-device inspection showed `customApiUrl` had been stored as `Http://172.20.10.2:8080/`, which points to keyboard auto-capitalization on the first character of the URL.
  - the Android device can already reach both `127.0.0.1:8080` through `adb reverse` and `172.20.10.2:8080` directly, so the remaining auth failure is more likely caused by malformed app-side URL handling than raw network reachability.

### D-039
- Decision:
  - make the shared mobile `CustomActionSheet` content scrollable instead of leaving long option lists in a fixed-height static container.
- Status:
  - accepted
- Rationale:
  - the mobile language picker uses `basic-select-sheet`, which reuses `CustomActionSheet`.
  - without a `ScrollView`, long lists like the supported-language list cannot be scrolled on-device, and the issue is better fixed once in the shared sheet component than per screen.

### D-040
- Decision:
  - allow mobile asset barcode or QR scanning without the legacy `NFC_BARCODE` license entitlement, while keeping NFC scanning behind the entitlement gate.
- Status:
  - accepted
- Rationale:
  - the current mobile `ScanAssetScreen` and backend `GET /assets/barcode` endpoint were both blocking barcode or QR usage with the same scan-license check.
  - the user-reported problem is specifically on the barcode or QR path, and lifting that gate alone is the smallest safe change because it leaves NFC behavior unchanged.

### D-041
- Decision:
  - treat the dedicated mobile `Scan` screen as barcode/QR-only and harden the barcode modal with focus-based camera remounting instead of removing shared NFC scan support everywhere.
- Status:
  - accepted
- Rationale:
  - the physical-device issue is specific to reopening the dedicated barcode/QR scanner, and the dedicated `Scan` entry no longer needs an NFC option.
  - the shared `SelectNfc` route is still referenced by generic form fields, so removing it globally would be a broader change than needed for the current fix.

### D-042
- Decision:
  - no refactor decision yet on the new asset-centric QR requirement; treat it as an explicit architecture conflict with the accepted point-centric QR model until the revised business object is confirmed.
- Status:
  - superseded
- Rationale:
  - the implemented QR flow currently resolves `QrTag -> TrafficLightPoint -> Location`, and request, map, PM, and detail surfaces all build on that assumption.
  - switching to one-QR-per-child-asset would change not just QR generation, but also what the core traffic-light object is throughout the system.

### D-043
- Decision:
  - reject the asset-centric QR refactor and keep the existing point-centric model where one traffic-light point is anchored to one `Location`.
- Status:
  - accepted
- Rationale:
  - the current request, map, PM, and public QR flows already align around `Location -> TrafficLightPoint`.
  - the user explicitly chose to keep the older model and only automate provisioning from the location workflow.

### D-044
- Decision:
  - add a lightweight `Location.trafficLightEnabled` boolean only as an operational marker that tells the location workflow to auto-provision traffic-light records.
- Status:
  - accepted
- Rationale:
  - the generic Atlas `Location` model has no existing type field, and this is the smallest safe way to distinguish traffic-light locations without moving point metadata into `Location`.
  - the new flag is intentionally narrow in scope: it enables provisioning but does not replace `TrafficLightPoint` as the source of traffic-light-specific data.

### D-045
- Decision:
  - auto-create `TrafficLightPoint` and an active `QrTag` when a location is created or first enabled for traffic-light use, and do not allow the flag to be turned off once a point already exists.
- Status:
  - accepted
- Rationale:
  - this keeps the new behavior additive and avoids destructive or ambiguous “disable” behavior that could orphan existing traffic-light history, PM, requests, or map status.

### D-046
- Decision:
  - generate the default `poleCode` from the location custom ID and generate the active `qrPublicCode` with the rule `TLQR-C{companyId}-P{pointId}-V{version}-{random8}`.
- Status:
  - accepted
- Rationale:
  - `TrafficLightPoint.poleCode` is required, and deriving it from the existing location custom ID gives a stable default without needing a second sequence immediately.
  - the QR public code needs to be unique, versionable, and safe for future QR replacement, so the rule combines point identity, tag version, and a short random suffix.

### D-047
- Decision:
  - keep mobile aligned with the point-centric location workflow by exposing `trafficLightEnabled` in the mobile location form and returning a backend-built public QR URL in `TrafficLightPointDetailDTO`.
- Status:
  - accepted
- Rationale:
  - the previous mobile location flow created plain Atlas locations and never sent the provisioning marker needed for `TrafficLightPoint + QrTag` creation.
  - mobile also cannot reliably infer the correct public frontend base URL at runtime, so the backend detail DTO now provides the QR destination explicitly instead of forcing mobile to guess from API settings.

### D-048
- Decision:
  - keep the existing web `Location` map picker surface, geocode the form `address` into picker coordinates automatically, and stabilize select-mode behavior with `panTo` rather than a fully controlled `center/zoom` map.
- Status:
  - accepted
- Rationale:
  - the current map picker was already wired into the `Location` form, so replacing it would be broader than necessary.
  - the real gap was behavior, not presence: the picker used `defaultCenter/defaultZoom` semantics that felt reset-prone during form rerenders and had no address-to-map geocoding at all.
  - the older `react-google-maps` wrapper in this repo is more stable when the select-mode map remains largely uncontrolled and only recenters through imperative `panTo` calls.

### D-049
- Decision:
  - keep click-to-select coordinates immediate, but require an explicit `OK` action in the map popup before replacing the form `address` value with the reverse-geocoded place text.
- Status:
  - accepted
- Rationale:
  - users need to inspect the resolved place name and coordinates before overwriting the typed address, especially when clicking an approximate point on the map.
  - this keeps the UX close to Google Maps while preserving the current form structure and minimizing change scope to the select-mode picker only.

### D-050
- Decision:
  - add a dedicated search field inside the `Map Coordinates` form control and only trigger map recentering from that field when the user explicitly searches.
- Status:
  - accepted
- Rationale:
  - relying only on the main `address` input makes the map picker feel indirect and unclear during location creation.
  - keeping a local search input inside the picker makes the map field self-contained while still preserving the outer `address` field as the confirmed canonical value.

### D-051
- Decision:
  - default the select-mode map picker to Taiwan and bias geocoding searches toward Taiwan while still allowing reverse-geocoded click confirmation to fall back to coordinates when Google returns no formatted address.
- Status:
  - accepted
- Rationale:
  - this project is being tested primarily with Taiwanese traffic-light locations, so opening the picker over Taiwan reduces unnecessary navigation.
  - Google reverse geocoding does not guarantee a named address for every arbitrary clicked point, so the picker should show the best available address but still remain usable when only coordinates are available.

### D-052
- Decision:
  - explicit picker search will try Google geocoding first and then fall back to Places query resolution, while click-selected points will try reverse geocoding first and then fall back to nearby place lookup.
- Status:
  - accepted
- Rationale:
  - the user needs the picker to behave closer to Google Maps, where both search and point selection can surface human-readable place text.
  - relying on only one Google service leaves too many cases where the UI falls straight back to coordinates, especially for arbitrary clicked points or environment-specific key restrictions.

### D-053
- Decision:
  - intercept POI clicks in select-mode map picking, stop Google's default info card, and resolve those clicks through `PlacesService.getDetails(...)` so the app can show its own popup with the same `OK` address-confirmation action used elsewhere.
- Status:
  - accepted
- Rationale:
  - without intercepting `placeId`, named places open a Google-owned info card that the form cannot use to update `address`.
  - POI clicks and arbitrary map clicks should converge on one predictable picker UX inside the app.

### D-054
- Decision:
  - treat `placeId` fallback results as POI-only enrichment and route generic map-feature clicks back through coordinate-based reverse geocoding, with a preference for broader route or area results when Google's top reverse-geocode result is an over-specific nearby rooftop address.
- Status:
  - accepted
- Rationale:
  - user testing showed that road-feature clicks could still inherit the same nearest building address repeatedly, which is technically valid Google geocoding output but misleading for a picker UX.
  - named POI clicks and arbitrary map clicks need different fallbacks: POIs should keep as much place context as the key can resolve, while arbitrary clicks should prefer the best location description for the clicked coordinates rather than a sticky nearest premise.

### D-055
- Decision:
  - when a named POI click falls back from `PlacesService.getDetails(...)` to geocoder output, try a very local nearby-place lookup to recover the title before giving up and showing only address or coordinates.
- Status:
  - accepted
- Rationale:
  - current user testing still showed title loss on identified places, which means the address-only geocoder fallback is not sufficient for a usable picker UX.
  - this keeps the fallback narrow: it only applies to the degraded POI path and only accepts nearby-place titles within a short distance threshold, so generic map clicks are not mislabeled as arbitrary POIs.

### D-056
- Decision:
  - stop further app-side map-picker fallback changes until the Google Cloud project behind the current `GOOGLE_KEY` enables the APIs required by the existing picker flow.
- Status:
  - accepted
- Rationale:
  - direct REST checks with the current key returned `REQUEST_DENIED` for `Geocoding API` and legacy Places web-service probes.
  - a separate headless Chromium probe on `http://127.0.0.1` using the same key reproduced `REQUEST_DENIED` from `google.maps.Geocoder().geocode(...)`, `PlacesService.nearbySearch(...)`, and `PlacesService.findPlaceFromQuery(...)` inside the actual Maps JavaScript environment.
  - because the base Maps JavaScript script still loads successfully, the remaining bug is not that the map is missing; it is that the project configuration does not currently authorize the name and address resolution services the picker depends on.

## 2026-04-19 - Local Backend Startup Recovery Decisions

### D-057
- Decision:
  - prefer the native PostgreSQL 16 instance on `localhost:5432` for the current local demo path, with Docker PostgreSQL on `5433` kept only as a fallback when the host database is unavailable.
- Status:
  - accepted
- Rationale:
  - after reinstalling PostgreSQL locally and recreating `atlas` plus `rootUser`, the backend connects cleanly to `localhost:5432/atlas`.
  - this now matches the user's current workstation setup more directly than the earlier temporary Docker-only workaround.

### D-058
- Decision:
  - break the Spring startup bean cycle by replacing the traffic-light service-to-service callbacks with repository-level lookups inside `TrafficLightPointService` and `PreventiveMaintenanceMapper`.
- Status:
  - accepted
- Rationale:
  - Spring Boot 3.2 prohibits circular references by default, and local startup exposed a real cycle involving `WorkOrderService`, `LocationService`, `TrafficLightPointService`, `RequestService`, and PM mapping.
  - keeping the fix at the repository and sequence-service level preserves existing request and work-order behavior without enabling `spring.main.allow-circular-references`.

### D-059
- Decision:
  - document an explicit local `api` env baseline with non-empty demo values for required placeholders such as `MAIL_RECIPIENTS` and `KEYGEN_PRODUCT_TOKEN` even when notifications and licensing are effectively disabled for local demo runs.
- Status:
  - accepted
- Rationale:
  - `api/src/main/resources/application.yml` resolves several placeholders as required values during bean creation.
  - local `spring-boot:run` does not automatically inherit root `.env` values, so blank or missing placeholders can block startup before the app reaches functional code paths.

## 2026-04-19 - Web Map Picker Preview Lifecycle Decisions

### D-060
- Decision:
  - decouple the select-mode map search effect from parent rerenders by using refs for the latest `onSelect` callback and selected coordinates, and only clear the place preview when a genuinely new search request is submitted.
- Status:
  - accepted
- Rationale:
  - after a successful search or POI click, `onSelect` updates the parent form, which re-renders and changes `selected` plus inline callback identities.
  - the old search effect depended on those parent values and began by clearing `selectedPlacePreview`, so the popup could appear briefly and then disappear immediately even though the actual map selection was valid.

### D-061
- Decision:
  - keep the web `Location` map picker fields directly under the `address` field instead of appending them near the end of the form.
- Status:
  - accepted
- Rationale:
  - once the map picker is behaviorally usable, the next most important UX improvement is making the address-to-map relationship visually obvious.
  - moving only the field order in `Locations/index.tsx` is the smallest safe change because it preserves the existing shared form renderer and all current map-picker logic.
