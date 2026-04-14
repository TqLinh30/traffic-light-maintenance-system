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
  - accepted
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
