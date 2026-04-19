# Testing Checklist

## Phase 0
- Discovery only
- No application behavior changed
- No backend or frontend automated tests run in this phase

## Phase 1
- Architecture and data-model alignment only
- No application behavior changed
- No backend or frontend automated tests run in this phase

## Backend Testing Expectations For Later Phases
- Validate QR resolve route behavior
- Validate permissions for public and authenticated flows
- Validate request payload shape
- Validate valid QR code flow
- Validate invalid QR code flow
- Validate disabled QR code flow
- Validate point not found flow
- Validate request submit success
- Validate request validation failure
- Validate duplicate request handling if implemented
- Validate approve success
- Validate reject success
- Validate work order creation success

## Frontend Testing Expectations For Later Phases
- QR landing loading state
- QR landing invalid or expired QR state
- request form empty state
- request form validation failures
- request form success path
- request form network failure path
- mobile-friendly layout and navigation
- admin request review visibility
- map marker rendering and filters

## Existing Test Baseline
- Backend test directory exists:
  - `api/src/test/java/com/grash/ApiApplicationTests.java`
- No focused automated tests for this traffic-light customization were discovered yet.

## Phase 2 Verification Performed
- Backend compile:
  - `./mvnw.cmd -q -DskipTests compile`
  - result: passed
- Focused unit tests:
  - `./mvnw.cmd -q -Dtest=TrafficLightPointServiceTest test`
  - result: passed

## Phase 2 Automated Coverage Added
- `api/src/test/java/com/grash/service/TrafficLightPointServiceTest.java`
- Covered behaviors:
  - QR request creation populates traffic-light request metadata
  - disabled QR tags are rejected with `410 GONE`
  - public point DTO converts audit timestamps correctly and derives due-soon maintenance status

## Remaining Backend Validation Gaps
- No controller-level integration tests yet for:
  - `GET /traffic-light-qr/{qrPublicCode}`
  - `POST /traffic-light-qr/{qrPublicCode}/requests`
- No end-to-end validation yet for:
  - security configuration around public QR access
  - request approval to work-order conversion with QR metadata present

## Phase 3 Verification Performed
- Frontend targeted lint:
  - `npx eslint src/content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage.tsx src/router/index.tsx src/models/owns/trafficLight.ts src/i18n/translations/en.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with pre-existing dependency warnings

## Phase 3 Validation Coverage
- Loading state:
  - covered by dedicated loading spinner while QR context resolves
- Error state:
  - covered by invalid or inactive QR alert handling
- Success flow:
  - covered by dedicated success route and persisted success state
- Mobile-friendly behavior:
  - verified through responsive MUI layout and successful production build

## Pre-Existing Frontend Warnings
- `stylis-plugin-rtl` source map warning appears during build and is unrelated to the traffic-light QR changes.
- `babel-preset-react-app` dependency warning appears during build and is unrelated to the traffic-light QR changes.

## Phase 4 Verification Performed
- Frontend targeted lint:
  - `npx eslint src/models/owns/request.ts src/content/own/Requests/index.tsx src/content/own/Requests/RequestDetails.tsx src/i18n/translations/en.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings

## Phase 4 Review Notes
- Approve and reject handlers were not changed in this phase.
- Work order navigation after approval remains on the existing `approveRequest(...)` path in `RequestDetails.tsx`.
- Validation for QR metadata display is now build-verified, but there is still no automated browser test covering manual approve or reject clicks.

## Phase 5 Verification Performed
- Backend focused unit tests:
  - `./mvnw.cmd -q -Dtest=TrafficLightPointServiceTest test`
  - result: passed
- Backend compile:
  - `./mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/content/own/components/Map/index.tsx src/models/owns/trafficLight.ts src/i18n/translations/en.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings

## Phase 5 Validation Coverage
- Backend summary mapping:
  - focused unit coverage now includes `TrafficLightPointService.getMapPoints(...)`
- Marker rendering path:
  - build-verified through the new traffic-light map tab and shared map marker model
- Filter behavior:
  - build-verified for status and district filtering in the locations screen
- Drill-in behavior:
  - build-verified through marker `href` routing to the existing location detail surface

## Remaining Map Validation Gaps
- No browser automation yet covers map marker clicks or filter interactions.
- No load test yet validates dense point counts, clustering thresholds, or viewport-based fetch behavior.

## Phase 6 Verification Performed
- Backend focused unit tests:
  - `./mvnw.cmd -q -Dtest=TrafficLightPointServiceTest test`
  - result: passed
- Backend compile:
  - `./mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/LocationDetails.tsx src/content/own/Locations/TrafficLightPointPanel.tsx src/models/owns/trafficLight.ts src/i18n/translations/en.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings

## Phase 6 Validation Coverage
- PM-aware next-maintenance derivation:
  - covered by focused `TrafficLightPointServiceTest` assertions for PM next-work-order dates
- Point-detail read model:
  - covered by focused `TrafficLightPointServiceTest` assertions for PM summaries and recent work-order history
- Location drawer rendering:
  - build-verified through the new conditional traffic-light tab and detail panel wiring

## Remaining Phase 6 Validation Gaps
- No browser automation yet covers the conditional traffic-light tab in `LocationDetails`.
- No controller-level integration test yet covers `GET /traffic-light-points/location/{locationId}`.

## Phase 7 Verification Performed
- Backend focused unit tests:
  - `./mvnw.cmd -q -Dtest=TrafficLightPointServiceTest test`
  - result: passed
- Backend compile:
  - `./mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend build regression pass:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings

## Phase 7 Regression Checklist
- Valid QR resolve endpoint still public and build-verified
- QR request creation path still compiles and retains additive metadata model
- Internal traffic-light map still builds after backend summary optimization
- Internal traffic-light point detail still builds after backend summary optimization
- Existing request review UI remains untouched in this phase

## Remaining Hardening Gaps
- No controller-level integration test yet covers the internal traffic-light map or detail endpoints.
- No browser automation yet covers QR entry, map filters, or the traffic-light location-detail tab.
- Duplicate-request prevention remains a documented follow-up rather than an implemented rule.

## Post-Phase Localization Verification Performed
- Locale coverage check:
  - node-based runtime load of `en`, `vi`, and `zh_tw`
  - result: `vi` and `zh_tw` both expose `1568/1568` keys with zero missing keys relative to `en`
- Frontend targeted lint:
  - `npx eslint src/i18n/i18n.ts src/contexts/JWTAuthContext.tsx src/content/own/Settings/General/index.tsx src/content/own/Settings/RequestPortal/PublicPage/RequestPortalPublicPage.tsx src/content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage.tsx src/i18n/translations/vi.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed

## Post-Phase Localization Validation Coverage
- Traditional Chinese settings flow:
  - verified by code path review and build for normalized stored value + shared language switch helper
- Vietnamese registration:
  - verified by runtime locale load check and supported-language metadata check
- Public page language switching:
  - verified by replacing direct `i18n.changeLanguage(...)` calls with the shared helper in request portal and traffic-light QR flows

## Post-Phase Localization Residual Gaps
- No browser automation yet confirms visual language switching end to end on the settings page.
- Machine-translated strings should still get manual terminology review on high-visibility surfaces.

## Settings Dropdown Follow-Up Verification Performed
- Frontend targeted lint:
  - `npx eslint src/content/own/Settings/General/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings

## Settings Dropdown Follow-Up Notes
- Root cause:
  - the language selector on `Settings/General/index.tsx` still flowed through Formik `Field` state and could retain the initial `EN` value while app i18n had already switched.
- Fix:
  - enabled Formik reinitialization for the form
  - replaced the language `Field` with a directly controlled `Select`
  - updated the selected language through `setFieldValue(...)`, `patchGeneralPreferences(...)`, and `switchAppLanguage(...)`

## First-Switch Follow-Up Verification Performed
- Frontend targeted lint:
  - `npx eslint src/content/own/Settings/General/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings

## First-Switch Follow-Up Notes
- Additional fix:
  - the settings dropdown now renders from `i18n.language` and switches the app language before persisting the selected company language.
- Intent:
  - remove the first-load race that only appeared for lazy-loaded `vi` and `zh_tw`.

## Mobile Localization Verification Performed
- Mobile formatting:
  - `npx prettier --write i18n/i18n.ts contexts/AuthContext.tsx screens/SettingsScreen.tsx i18n/translations/vi.ts i18n/translations/zh_tw.ts`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: passed

## Mobile Localization Notes
- Added:
  - shared mobile language registry with lower-case runtime codes and backend enum-code mapping
  - mobile settings `List.Item` language picker using the existing `basic-select-sheet`
  - immediate `i18n.changeLanguage(...)` on selection with conditional `patchGeneralPreferences(...)`
  - bundled mobile `vi` and `zh_tw` translation resources
- Environment note:
  - mobile verification initially failed because local `mobile/node_modules` had been installed without dev dependencies.
  - running `npm install` restored the local toolchain needed for `prettier` and `tsc`; the accidental manifest changes from that install were removed before closeout.

## Mobile Localization Residual Gaps
- No device-level or simulator-level manual validation yet for:
  - first-time language change on the mobile settings screen
  - local-only language switching when the authenticated role lacks `PermissionEntity.SETTINGS`
- `vi` and `zh_tw` mobile copy still need a native-speaker terminology pass before production.

## Mobile Auth Diagnostics Verification Performed
- Mobile formatting:
  - `npx prettier --write config.ts screens/auth/LoginScreen.tsx screens/auth/RegisterScreen.tsx screens/auth/CustomServerScreen.tsx`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: failed because of a pre-existing unrelated Expo FileSystem typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`

## Mobile Auth Diagnostics Notes
- Root causes identified:
  - `mobile/app.config.ts` currently injects `extra.API_URL` from `process.env.API_URL`, but the local mobile environment had no `.env` file and no `API_URL` set.
  - `mobile/config.ts` previously assumed a default API URL always existed, so first-run auth could fail before any network request and still look like `wrong_credentials`.
  - `mobile/screens/auth/LoginScreen.tsx` and `RegisterScreen.tsx` previously hid the underlying error by always showing generic snackbar messages.
- Fixes applied:
  - `getApiUrl()` now throws an explicit configuration error when no default or custom API URL exists.
  - mobile login and register now surface `getErrorMessage(...)` instead of always showing the same generic auth text.

## Mobile Auth Diagnostics Residual Gaps
- No automated or manual device validation yet confirms the fixed error message on a physical device.
- `LoadBundleFromServerRequestError: Could not load bundle` remains an environment or Metro connectivity issue, not an app-code auth issue.

## Local Backend Runtime Verification Performed
- Docker PostgreSQL connectivity:
  - `docker exec atlas_db_5433 sh -lc "PGPASSWORD=mypassword psql -U rootUser -d atlas -c 'SELECT 1;'" `
  - result: passed
- Backend startup:
  - backend launched successfully with `DB_URL=localhost:5433/atlas` and supporting env vars
  - result: passed
- Runtime confirmation:
  - log contains `Started ApiApplication`
  - backend process remains running on `8080`

## Local Backend Runtime Notes
- The workstation already runs a native `postgresql-x64-15` service on `5432`, which could not be stopped from the current session.
- The project backend was therefore started against a separate Docker PostgreSQL container published on `5433`.
- `http://localhost:8080/swagger-ui/index.html` currently responds with `403`, but the Spring Boot process is fully started and serving requests.

## Local Backend Startup Recovery Verification Performed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Backend local startup recovery:
  - launched `.\mvnw.cmd spring-boot:run` with native PostgreSQL on `localhost:5432/atlas`, the current MinIO settings, and explicit demo placeholder values including `MAIL_RECIPIENTS=devnull@example.com` and `KEYGEN_PRODUCT_TOKEN=local-dev-token`
  - result: passed
- Runtime confirmation:
  - `api/backend-start-test.out.log` ends with `Started ApiApplication in 19.9 seconds`
  - result: backend startup is currently healthy on `http://localhost:8080`

## Local Backend Startup Recovery Notes
- Root causes:
  - local `spring-boot:run` failed early when required placeholders such as `ENABLE_EMAIL_NOTIFICATIONS`, `MAIL_RECIPIENTS`, and `KEYGEN_PRODUCT_TOKEN` were missing or blank in the shell session
  - once placeholders were supplied, Spring still failed because `TrafficLightPointService` depended on `RequestService` and `WorkOrderService`, while the PM mapper also depended on `WorkOrderService`, creating a circular reference through `LocationService`
- Fix:
  - supplied a documented local env baseline for required placeholders during local startup
  - moved QR request creation in `TrafficLightPointService` to direct repository persistence plus `CustomSequenceService`
  - replaced `WorkOrderService` callbacks with direct `WorkOrderRepository` queries in both `TrafficLightPointService` and `PreventiveMaintenanceMapper`
- Residual gap:
  - this recovery pass verified backend startup and compile only; full manual browser validation of the web demo stack against the recovered backend is still pending

## Local Frontend Runtime Recovery Verification Performed
- Frontend runtime config inspection:
  - confirmed `frontend/.env` and `frontend/.env.example` were both set to `API_URL=https://localhost:8080`
  - result: matches the browser-side `ERR_SSL_PROTOCOL_ERROR` seen during local signup because the backend only serves plain HTTP on local port `8080`
- Local frontend config recovery:
  - updated `frontend/.env` and `frontend/.env.example` to `API_URL=http://localhost:8080`
  - result: local frontend runtime config now matches the current backend protocol

## Local Frontend Runtime Recovery Notes
- Root cause:
  - the frontend uses `runtime-env-cra` during `npm start`, so the local `.env` value is injected into browser runtime config as-is.
  - with `API_URL=https://localhost:8080`, browser requests to `/auth/signup` failed before reaching the backend because the local Spring Boot server is not configured for TLS.
- Follow-up:
  - restart the frontend dev server after changing `frontend/.env` so `public/runtime-env.js` is regenerated with the corrected `http://` URL

## Mobile Dev-Client Runtime Verification Performed
- Metro reachability on the workstation:
  - `Get-NetTCPConnection -LocalPort 8081 -State Listen`
  - result: Metro is listening locally on `8081`
- Metro status endpoint:
  - `Invoke-WebRequest http://localhost:8081/status`
  - `Invoke-WebRequest http://192.168.0.103:8081/status`
  - result: both return `packager-status:running`
- Custom Server screen code-path review:
  - `mobile/screens/auth/CustomServerScreen.tsx`
  - result: screen only saves `customApiUrl` to `AsyncStorage` and does not make network or bundle-loading calls

## Mobile Dev-Client Runtime Notes
- `LoadBundleFromServerRequestError: Could not load bundle` is a Metro or Expo dev-client connectivity issue, not a backend API issue.
- During physical-device testing with `npx expo start --dev-client --host lan`, the device must be able to reach:
  - backend API on `http://<host-lan-ip>:8080`
  - Metro bundle server on `http://<host-lan-ip>:8081`
- The `Custom Server` screen configures only the backend API URL and cannot fix a Metro bundle-loading failure by itself.

## Mobile Physical-Device Follow-Up Verification Performed
- ADB connectivity:
  - `adb devices -l`
  - result: physical Android device `SM_N981N` is connected and authorized
- USB reverse tunneling:
  - `adb reverse tcp:8081 tcp:8081`
  - `adb reverse tcp:8080 tcp:8080`
  - result: device can access host Metro and backend through `127.0.0.1`
- Device logcat root-cause capture:
  - launching the app and opening the `Custom Server` path produced `LoadBundleFromServerRequestError`
  - logged URL contained `screens\\auth\\CustomServerScreen.bundle`
  - result: root cause identified as a Windows path separator issue in a lazy-loaded split bundle
- Post-fix verification:
  - removed `React.lazy(...)` for `CustomServerScreen` in mobile navigation
  - relaunched the app via `adb` with `exp+atlas-cmms://expo-development-client/?url=http://127.0.0.1:8081`
  - result: the previous `CustomServerScreen.bundle` load error no longer reappeared in logcat
- Device storage stabilization for USB testing:
  - reinitialized the app `RKStorage` database with a minimal valid `AsyncStorage` schema and `customApiUrl=http://127.0.0.1:8080/`
  - result: physical-device test state is now aligned with the current USB reverse setup

## Mobile Physical-Device Follow-Up Notes
- The `127.0.0.1:8080` custom API URL is only appropriate while `adb reverse tcp:8080 tcp:8080` remains active.
- If the USB cable is disconnected or `adb reverse` is cleared, the device should switch back to a LAN-reachable backend URL such as `http://<host-lan-ip>:8080`.
- `npx tsc --noEmit` still fails due the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`, unrelated to the navigation fix.

## Mobile Auth Connectivity Follow-Up Verification Performed
- Device-level TCP reachability:
  - `adb shell sh -c "toybox nc -zv 127.0.0.1 8080"`
  - `adb shell sh -c "toybox nc -zv 172.20.10.2 8080"`
  - result: both endpoints are reachable from the physical Android device
- Device-side stored URL inspection:
  - extracted current `AsyncStorage` database from the app sandbox
  - result: `customApiUrl` had been stored as `Http://172.20.10.2:8080/`
- Mobile URL-handling hardening:
  - `mobile/config.ts` now lowercases the URL scheme before appending the trailing slash
  - `mobile/screens/auth/CustomServerScreen.tsx` now disables auto-capitalization and auto-correct, uses URL keyboard mode, and saves the normalized URL
- Mobile API diagnostics:
  - `mobile/utils/api.ts` now reports the destination URL when a fetch fails with `Network request failed`

## Mobile Auth Connectivity Follow-Up Notes
- The targeted `npx eslint ...` attempt did not run because the mobile workspace currently lacks a local ESLint setup and `npx` pulled ESLint v10, which expects flat config.
- This lint failure is environmental and unrelated to the scoped mobile URL-handling changes.

## Mobile Settings Picker Follow-Up Verification Performed
- Mobile formatting:
  - `npx prettier --write components/actionSheets/CustomActionSheet.tsx`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: still fails only because of the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`

## Mobile Settings Picker Follow-Up Notes
- Root cause:
  - `mobile/components/actionSheets/CustomActionSheet.tsx` rendered options directly inside a static `View` and `List.Section`, with no scroll container for long lists.
- Fix:
  - wrapped the visible options list in a nested-scroll-enabled `ScrollView`
  - constrained the sheet content height to `60%` of the current window height so long lists can scroll inside the sheet
- Residual gap:
  - no device-level manual confirmation has been run yet after the code change; the next check should be opening Settings and swiping through the language list on the physical device

## Mobile Scan Follow-Up Verification Performed
- Mobile formatting:
  - `npx prettier --write screens/ScanAssetScreen.tsx`
  - result: passed
- Backend compile:
  - `./mvnw.cmd -q -DskipTests compile`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: still fails only because of the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`

## Mobile Scan Follow-Up Notes
- Root cause:
  - `mobile/screens/ScanAssetScreen.tsx` blocked both NFC and barcode or QR scanning behind the `NFC_BARCODE` entitlement.
  - `api/src/main/java/com/grash/controller/AssetController.java` also blocked `GET /assets/barcode` with the same entitlement, so barcode or QR scanning could not work end to end even if the mobile screen were changed alone.
- Fix:
  - kept the existing entitlement check on the NFC option
  - removed the entitlement check from the mobile barcode or QR option
  - removed the matching entitlement guard from backend `GET /assets/barcode`
- Residual gap:
  - no device-level manual validation has been run yet after the code change; the next check should be opening `Scan -> Mã vạch/QR code` on the physical device and confirming that NFC still shows the license error when appropriate

## Mobile Scan Lifecycle Follow-Up Verification Performed
- Mobile formatting:
  - `npx prettier --write screens/ScanAssetScreen.tsx screens/modals/SelectBarcodeModal.tsx`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: still fails only because of the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`

## Mobile Scan Lifecycle Follow-Up Notes
- Root cause:
  - the dedicated `Scan` screen callback opened `SelectBarcode` but never dismissed it after a successful scan, unlike the shared form-field barcode picker flow.
  - `mobile/screens/modals/SelectBarcodeModal.tsx` also kept the camera view mounted without any focus-driven reset, which makes repeated opens on a physical device more fragile.
- Fix:
  - removed the NFC option from the dedicated `Scan` screen so it is now barcode/QR-only
  - dismissed the barcode modal from the dedicated `Scan` screen callback before continuing to the asset lookup flow
  - made the barcode modal reset `scanned`, re-request permission state on focus, and only render an active `CameraView` while focused
- Residual gap:
  - no device-level manual confirmation has been run yet after the lifecycle change; the next check should be opening the dedicated barcode/QR scanner twice in a row on the physical device

## Location Traffic-Light Automation Verification Performed
- Backend focused tests:
  - `.\mvnw.cmd -q "-Dtest=TrafficLightPointServiceTest,LocationServiceTest" test`
  - result: passed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend formatting:
  - `npx prettier --write src/models/owns/location.ts src/models/owns/trafficLight.ts src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightPointPanel.tsx src/i18n/translations/en.ts src/i18n/translations/vi.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/models/owns/location.ts src/models/owns/trafficLight.ts src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightPointPanel.tsx src/i18n/translations/en.ts src/i18n/translations/vi.ts src/i18n/translations/zh_tw.ts`
  - result: passed
- Frontend production build:
  - `npm run build`
  - result: passed with the same pre-existing dependency warnings already seen elsewhere in the frontend build

## Location Traffic-Light Automation Notes
- Root cause:
  - the project had a point-centric QR model and public QR flow, but the generic `Location` create/update flow never provisioned the required `TrafficLightPoint` or `QrTag`.
  - because `TrafficLightPoint.poleCode` is mandatory and `TrafficLightPointDetailDTO` did not expose active QR data, even a manually created point could not show its QR inside the internal location drawer.
- Fix:
  - added a narrow `trafficLightEnabled` flag to `Location` and backfilled it for already-existing traffic-light locations
  - extended `LocationService.create(...)` and `LocationService.update(...)` to auto-provision `TrafficLightPoint` plus an active `QrTag`
  - exposed `activeQrPublicCode` in the existing traffic-light detail DTO and rendered the QR image plus copy/open/download/print actions in the location traffic-light panel
- Residual gap:
  - manual browser validation is still needed for the actual create/edit location form and location drawer flow against a running backend with Liquibase applied

## Mobile Traffic-Light Location Parity Verification Performed
- Backend focused tests:
  - `.\mvnw.cmd -q "-Dtest=TrafficLightPointServiceTest,LocationServiceTest" test`
  - result: passed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Mobile formatting:
  - `npx prettier --write models/location.ts models/trafficLight.ts utils/fields.ts components/BasicField.tsx screens/locations/CreateLocationScreen.tsx screens/locations/EditLocationScreen.tsx screens/locations/details/LocationDetails.tsx screens/locations/details/LocationTrafficLightPanel.tsx i18n/translations/en.ts i18n/translations/vi.ts i18n/translations/zh_tw.ts`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: still fails only because of the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`

## Mobile Traffic-Light Location Parity Notes
- Root cause:
  - mobile `CreateLocation` and `EditLocation` did not expose `trafficLightEnabled`, so locations created from mobile never triggered point and QR provisioning.
  - mobile `LocationDetails` only rendered generic location metadata and never called `GET /traffic-light-points/location/{locationId}`, so even existing QR-enabled locations had no mobile QR surface.
- Fix:
  - added `trafficLightEnabled` to the mobile location model and form fields
  - defaulted the create flow to `trafficLightEnabled: false` and bound the edit flow to the stored value
  - added `LocationTrafficLightPanel` to mobile location detail, backed by `GET /traffic-light-points/location/{locationId}`
  - extended `TrafficLightPointDetailDTO` with `activeQrPublicUrl` so mobile can render a scannable QR target without guessing the public web origin
  - added `react-native-qrcode-svg` to render the QR directly on mobile
- Residual gap:
  - manual device validation is still needed for two cases:
    - create a new mobile location with `Traffic light location` enabled and verify the QR section appears
    - edit an older location that was created before this fix, enable `Traffic light location`, and verify the QR section appears after provisioning

## Web Location Map Picker Verification Performed
- Frontend formatting:
  - `npx prettier --write src/content/own/components/Map/index.tsx src/content/own/components/form/SelectMapCoordinates.tsx src/content/own/components/form/index.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/components/Map/index.tsx src/content/own/components/form/SelectMapCoordinates.tsx src/content/own/components/form/index.tsx src/content/own/Locations/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the pre-existing `stylis-plugin-rtl` source-map warning and the existing `babel-preset-react-app` dependency warning
- External Google API verification:
  - direct HTTP probe with the current key against `https://maps.googleapis.com/maps/api/geocode/json?...`
  - result: `REQUEST_DENIED` with an explicit message that `Geocoding API` is not activated on the current Google project
  - direct HTTP probe with the current key against `https://maps.googleapis.com/maps/api/place/nearbysearch/json?...`
  - result: `REQUEST_DENIED` with an explicit message that the legacy Places web-service API is not enabled for the current project
- Browser-context Google API verification:
  - launched headless Chromium on `http://127.0.0.1` with a minimal probe page using the exact `GOOGLE_KEY` from `frontend/.env`
  - result: the Maps JavaScript base script loaded successfully, but `google.maps.Geocoder().geocode(...)`, `PlacesService.nearbySearch(...)`, and `PlacesService.findPlaceFromQuery(...)` all returned `REQUEST_DENIED`

## Web Location Map Picker Notes
- Root cause:
  - the `Location` form already exposed a map picker once `GOOGLE_KEY` was configured, but the picker only mirrored `coordinates` and never geocoded the `address` field.
  - the shared map component also relied on `defaultCenter/defaultZoom` semantics during select mode, so picking a point could feel like the map snapped back to its initial zoom or center when the form rerendered.
- Fix:
  - passed the current form `address` into `SelectMapCoordinates`
  - kept the select-mode map on the stable shared component path and recenters it with `panTo` when the selected coordinates or geocoded address change
  - added debounced address geocoding inside the map picker and pushed the resolved coordinates back into the form
  - added reverse geocoding on click, a select-mode info popup, and an explicit `OK` button that writes the resolved place text back into the form `address`
  - added a dedicated search box inside `Map Coordinates` so the user can search directly in the picker without relying only on the outer `address` input
  - switched reverse geocoding to use a Google `LatLng` object for click-selected points to improve readable address resolution
  - defaulted the select-mode picker to Taiwan and biased geocoding searches with `region: 'TW'`
  - allowed repeated explicit searches of the same query by adding a request counter instead of treating identical text as a no-op
  - fixed the shared `Map` wrapper so the explicit picker search trigger actually reaches the select-mode map component
  - added a Places fallback for explicit search and a nearby-place fallback for click-selected coordinates when pure geocoding does not produce a readable address
  - intercepted POI clicks with `placeId` and resolved them through `PlacesService.getDetails(...)` so named places now use the app's own popup plus `OK` flow instead of the Google-owned info card
  - separated named-POI fallback from generic feature clicks so non-POI `placeId` features now fall back to coordinate-based reverse geocoding
  - added a reverse-geocode heuristic that prefers broader route or area results when Google's top match is an over-specific nearby rooftop or interpolated address
  - enriched degraded POI fallback with a short-range nearby-place lookup so named places can still keep a title when `getDetails(...)` is unavailable but nearby place metadata is still accessible
  - moved select-mode search and popup updates onto refs for the latest callback and coordinates so a parent rerender after `onSelect` no longer clears the popup immediately
  - reordered the web `Location` form fields so `Put location in map` and the `Map Coordinates` picker now sit immediately below `address`
- Residual gap:
  - manual browser validation is still needed with a real Google Maps key to confirm the geocoder returns the expected address for local traffic-light data in your target regions
  - the Google Cloud project behind `GOOGLE_KEY` must have `Geocoding API` enabled for address lookup and reverse geocoding to work reliably; richer identified-place labels and search behavior additionally depend on `Places API`
  - until those services stop returning `REQUEST_DENIED`, POI titles and search-driven recentering remain externally blocked regardless of additional frontend fallback logic
