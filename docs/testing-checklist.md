# Testing Checklist

## Phase 0
- Discovery only
- No application behavior changed
- No backend or frontend automated tests run in this phase

## 2026-04-25 - SignalCare Branding Verification
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/hooks/useBrand.ts src/content/pages/Auth/Register/Cover/index.tsx "src/i18n/translations/*.ts"`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing `stylis-plugin-rtl` source-map warning and `babel-preset-react-app` dependency warning already seen in earlier passes
- Mobile Expo config sanity:
  - `npx expo config --type public`
  - result: passed and confirmed the default display name is now `SignalCare`
- Mobile TypeScript check:
  - `npx tsc --noEmit`
  - result: failed because of pre-existing `expo-file-system` type errors in `mobile/screens/workOrders/WODetailsScreen.tsx`
- Home build attempt:
  - `npm run build`
  - result: blocked because `next` is not installed in the current local `home` environment
- Home dependency recovery attempt:
  - `npm ci`
  - result: failed because `home/package-lock.json` is already out of sync with `home/package.json`, so the build blocker is pre-existing environment or dependency drift rather than a branding regression

## 2026-04-25 - SignalCare SVG Logo Refresh Verification
- Approved source asset:
  - `C:/Users/tqlin/Downloads/codex/image/SVG/Asset 1.svg`
  - result: rendered successfully as the new canonical project logo source and copied into `logo/signalcare-logo.svg`
- Visual spot checks:
  - viewed `frontend/public/static/images/logo/logo.png`, `frontend/public/static/images/logo/logo-white.png`, `mobile/assets/images/icon.png`, `mobile/assets/images/adaptive-icon.png`, `mobile/assets/images/splash.png`, and `mobile/android/app/src/main/res/drawable-xxhdpi/notification_icon.png`
  - result: passed
- Asset dimension sanity:
  - confirmed expected sizes for the refreshed PNG surfaces, including `1254x1254` web logos, `1024x1024` backend and mobile icons, `512x512` mobile favicon, `651x651` mobile notification asset, and `1600x1600` splash assets
  - result: passed
- Android native asset sanity:
  - confirmed regenerated `notification_icon.png`, `splashscreen_logo.png`, `ic_launcher.webp`, and `ic_launcher_foreground.webp` dimensions across density buckets, including `mipmap-xxxhdpi/ic_launcher_foreground.webp=432x432`
  - result: passed
- Mobile Expo config sanity:
  - `npx expo config --type public`
  - result: passed and still resolves the refreshed `icon`, `notification`, `splash`, and `adaptiveIcon` assets with default app name `SignalCare`
- Notes:
  - this refresh changed assets only; no application logic was modified in this pass
  - the previously documented `frontend` full-lint, `mobile` typecheck, and `home` build blockers remain pre-existing and unchanged by the SVG asset refresh

## 2026-04-25 - Web Sidebar Light Palette Verification
- Frontend formatting:
  - `npx prettier --write src/layouts/ExtendedSidebarLayout/Sidebar/index.tsx src/layouts/ExtendedSidebarLayout/Sidebar/SidebarMenu/index.tsx src/layouts/ExtendedSidebarLayout/Sidebar/SidebarFooter/index.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/layouts/ExtendedSidebarLayout/Sidebar/index.tsx src/layouts/ExtendedSidebarLayout/Sidebar/SidebarMenu/index.tsx src/layouts/ExtendedSidebarLayout/Sidebar/SidebarFooter/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing `stylis-plugin-rtl` source-map warning and `babel-preset-react-app` dependency warning already seen in earlier frontend builds
- Scope verified:
  - desktop sidebar container now uses `theme.sidebar.background`, `theme.sidebar.dividerBg`, and `theme.sidebar.boxShadow`
  - sidebar menu headings, item text, icons, hover state, and active state now use `theme.sidebar.*` palette values instead of hardcoded white-on-dark styling
  - mobile drawer sidebar now uses the non-white logo variant on the new light background
  - sidebar footer action buttons now match the light menu palette and hover behavior
- Residual gap:
  - manual browser QA is still needed to judge the exact visual feel of the light modern palette on real data, especially the brand text, drawer presentation, and active-row emphasis

## 2026-04-25 - Web Traffic-Light Location Create UX Verification
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing `stylis-plugin-rtl` source-map warning and `babel-preset-react-app` dependency warning already seen in earlier frontend builds
- Scope verified:
  - the web `Add Location` modal now uses a dedicated traffic-light create form instead of the old shared optional-map create flow
  - `name` and `address` stay first, the map picker is always visible when Google Maps is configured, the Street View preview sits directly below the map, and the image upload field remains available as an override
  - the create submit path now forces `trafficLightEnabled=true` and keeps deriving `latitude` plus `longitude` from the selected `coordinates`
  - when no image is uploaded, the create flow now attempts a best-effort Street View static-image upload using the selected point before falling back to no image
- Residual gaps:
  - no browser automation or manual browser QA has yet confirmed the live Street View preview and fallback image upload against the current Google project configuration
  - the fallback image path still depends on runtime Google Street View access from the configured key, so selected points without Street View imagery or keys without the required access will continue to create the location without an automatic image

## 2026-04-25 - Web Location Create Coordinate And Street View Follow-Up Verification
- Frontend formatting:
  - `npx prettier --write src/content/own/components/form/SelectMapCoordinates.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/components/form/SelectMapCoordinates.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/Locations/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing `stylis-plugin-rtl` source-map warning and `babel-preset-react-app` dependency warning already seen in earlier frontend builds
- Scope verified:
  - confirming the map popup with `OK` no longer feeds the resolved address back into the internal search trigger, so the selected coordinates stay on the user-picked point instead of being shifted by a second geocode pass
  - the web `Add Location` Street View section now uses a live Google Street View panorama with native pan, zoom, fullscreen, and available street-navigation controls instead of a static image preview
  - the Street View fallback-image upload path remains intact for submit-time best-effort image generation when no manual image upload is provided
- Residual gaps:
  - no manual browser QA has yet confirmed the coordinate-stability fix against live map interaction in the running app
  - Street View panorama availability and navigation depth still depend on the selected point having Google Street View coverage in the current project region

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

## Traffic-Light Pole Detail Surface Verification Performed
- Backend focused test:
  - `.\mvnw.cmd -q -Dtest=LocationServiceTest test`
  - result: passed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/index.tsx src/content/own/Locations/LocationDetails.tsx src/content/own/Locations/TrafficLightPointPanel.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/models/owns/trafficLight.ts`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/content/own/Locations/LocationDetails.tsx src/content/own/Locations/TrafficLightPointPanel.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/models/owns/trafficLight.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing `stylis-plugin-rtl` source-map warning and the same existing `babel-preset-react-app` dependency warning

## Traffic-Light Pole Detail Surface Notes
- Root cause:
  - the location workflow had already been shifted to auto-provision `TrafficLightPoint`, but the web `Add Location` modal still stopped at name, address, map, Street View, and image, so operators had no place to capture pole lifecycle dates or manual maintenance notes during creation.
  - the first location-detail tab still led with the old assets list, which is a poor fit once each managed location is treated as one traffic-light pole in daily operations.
- Fix:
  - extended `TrafficLightPoint` persistence and DTO mapping with `expectedWarrantyDate` and `maintenanceHistory`, while keeping `installationDate` on the same extension entity
  - changed backend location creation to accept a create DTO instead of a raw `Location` entity so the traffic-light metadata can be written safely during creation, and taught the location service to sync those fields onto the provisioned point during create and update flows
  - extended the web `Add Location` modal with `installationDate`, `expectedWarrantyDate`, and optional `maintenanceHistory`
  - replaced the assets-first location-detail tab with a traffic-light information surface for traffic-light-enabled locations, including the pole image, lifecycle dates, manual notes, recent work-order history, PM schedules, and QR actions
- Residual gap:
  - manual browser validation is still needed to confirm the newly added create-form fields persist correctly through the running backend and Liquibase migration
  - the current web edit-location modal still does not expose the new traffic-light lifecycle fields, so follow-up work may be needed if operators must edit those values after creation

## Auto Image License Follow-Up Verification Performed
- Backend focused test:
  - `.\mvnw.cmd -q -Dtest=LocationServiceTest test`
  - result: passed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing `stylis-plugin-rtl` source-map warning and the same existing `babel-preset-react-app` dependency warning

## Auto Image License Follow-Up Notes
- Root cause:
  - the create flow treated the Street View fallback image exactly like a manual uploaded image and sent it through `/files/upload`.
  - `/files/upload` is blocked by the `FILE_ATTACHMENTS` license entitlement in `FileController`, while `uploadFiles(...)` on the frontend catches that error, shows a snackbar, and then still lets location creation continue.
  - the result was a confusing state where the location was created successfully but its `image` field stayed empty, so nothing appeared in `Traffic light information`.
- Fix:
  - kept manual image uploads on the normal file-attachment path
  - moved the auto-generated Street View fallback image to the backend location-create flow by sending base64 image data in `LocationCreateDTO`
  - added storage-service byte upload support so the backend can attach that generated image as a hidden `File` during location creation without calling the manual upload controller
- Residual gap:
  - manual browser validation is still needed to confirm the old red file-license snackbar no longer appears for the no-upload Street View fallback case and that the image now shows correctly in the location detail drawer

## Live Runtime Sync Verification Performed
- Runtime investigation:
  - confirmed the running Spring Boot process on `localhost:8080` was connected to a native PostgreSQL instance on `127.0.0.1:5434`, not the inactive Docker databases on `5432` or `5433`
  - result: passed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Focused backend test attempt:
  - `.\mvnw.cmd -q -Dtest=LocationServiceTest test`
  - result: failed during `testCompile` with widespread `package com.grash... does not exist` resolution errors in `LocationServiceTest` and `TrafficLightPointServiceTest`; this blocked focused-test reruns in the current environment and appears unrelated to the runtime sync itself because `compile` still passed and the live app started successfully
- Live backend restart:
  - stopped the stale Java process that was listening on `localhost:8080`
  - relaunched `.\mvnw.cmd spring-boot:run` with `DB_URL=localhost:5434/atlas`, the local MinIO settings, and explicit placeholder env values including `MAIL_RECIPIENTS=devnull@example.com` and `KEYGEN_PRODUCT_TOKEN=local-dev-token`
  - result: passed
- Liquibase runtime confirmation:
  - `api/backend-live.out.log` shows `Running Changeset: db/changelog/2026_04_25_1777100000_traffic_light_point_metadata.xml::2026_04_25_traffic_light_point_metadata_001::OpenAI`
  - result: passed
- Live database confirmation:
  - verified `traffic_light_point` now contains `installation_date`, `expected_warranty_date`, and `maintenance_history`
  - verified `databasechangelog` now includes `2026_04_25_traffic_light_point_metadata_001` executed at `2026-04-25 16:53:49`
  - verified the previously created sample location `test04` still has `NULL` for `image_id`, `installation_date`, `expected_warranty_date`, and `maintenance_history`
  - result: passed

## Live Runtime Sync Notes
- Root cause:
  - the local browser was pointed at a backend process that had not been restarted since before the latest traffic-light pole-detail and auto-image changes, so runtime behavior lagged behind the checked-out source and compiled classes.
  - because `test04` was created under that stale runtime, the missing metadata was not hidden in the UI; it was never written into the live database.
- Fix:
  - identified the active PostgreSQL instance from the live backend's open TCP connections
  - rebuilt the backend, restarted the live Spring Boot process against the active database, and let Liquibase apply the pending metadata migration
- Residual gap:
  - the existing row `test04` still needs recreate, edit, or targeted backfill work because its missing values were never stored before the runtime sync
  - manual browser validation is still needed to confirm that newly created traffic-light locations now persist image and lifecycle metadata correctly end to end

## Traffic-Light Edit And QR Detail Parity Verification Performed
- Backend compile:
  - `.\mvnw.cmd -q -DskipTests compile`
  - result: passed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/Locations/index.tsx src/content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage.tsx src/models/owns/trafficLight.ts src/slices/location.ts`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/Locations/index.tsx src/content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage.tsx src/models/owns/trafficLight.ts src/slices/location.ts`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same existing `stylis-plugin-rtl` source-map warning and the same existing `babel-preset-react-app` dependency warning
- Live backend refresh:
  - restarted `.\mvnw.cmd spring-boot:run` on `localhost:8080` against the active PostgreSQL instance on `localhost:5434`
  - result: passed
- Public QR runtime confirmation:
  - called `GET http://localhost:8080/traffic-light-qr/TLQR-C2-P3-V1-430BF7CF`
  - result: passed and the response now includes `point.locationImageUrl`, which is currently `null` for `test04` because that row still has no saved image

## Traffic-Light Edit And QR Detail Parity Notes
- Root cause:
  - the web traffic-light create flow had already been specialized, but edit remained on the old generic shared form and the public QR page still only surfaced a minimal summary.
  - that left no clean UI path to repair older traffic-light rows with missing lifecycle metadata or to show a real field-friendly pole summary when opening the point via QR.
- Fix:
  - extended the patch DTO and location update flow so traffic-light edits can save lifecycle metadata and attach a generated fallback image when the row still has no image
  - reused the dedicated traffic-light form for traffic-light location edits, including existing image preview and lifecycle-field prefill from point details
  - exposed signed location image URLs on the public point DTO and upgraded the public QR landing page to show pole image, installation date, expected warranty date, last inspection, and maintenance notes
- Residual gap:
  - manual browser validation is still needed to confirm the new edit modal and public QR layout feel correct in the actual UI
  - `test04` still needs one manual repair save or recreation before it can demonstrate the new image and lifecycle fields

## Mobile Traffic-Light Form And Detail Parity Verification Performed
- Mobile formatting:
  - `npx prettier --write screens/locations/TrafficLightLocationMapPicker.tsx screens/locations/TrafficLightLocationForm.tsx screens/locations/CreateLocationScreen.tsx screens/locations/EditLocationScreen.tsx screens/locations/details/LocationDetails.tsx screens/locations/details/index.tsx screens/locations/details/LocationTrafficLightPanel.tsx models/trafficLight.ts components/CustomDateTimePicker.tsx i18n/translations/en.ts`
  - result: passed
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: still fails only because of the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`

## Mobile Traffic-Light Form And Detail Parity Notes
- Root cause:
  - the earlier mobile parity pass only added the provisioning marker and a minimal QR panel, but mobile create or edit still used the generic location form and mobile detail still lacked the richer pole-first surface that the web flow now exposes.
  - the generic mobile form never handled `coordinates` at all, so there was no safe way to capture map-selected latitude or longitude, lifecycle dates, or maintenance notes from mobile operators.
- Fix:
  - added a dedicated mobile `TrafficLightLocationForm` for create and traffic-light edit flows, with `name`, `address`, a keyless in-app map picker, Street View and Google Maps launch actions, image upload, installation date, expected warranty date, and maintenance history
  - switched mobile `CreateLocation` to auto-submit `trafficLightEnabled=true` with the selected coordinates and lifecycle data
  - switched mobile traffic-light `EditLocation` to preload point detail metadata and keep the existing image unless a replacement is uploaded
  - upgraded the mobile location detail route so traffic-light locations now use a dedicated `Traffic Light Point` tab and render pole image, lifecycle dates, maintenance notes, recent work orders, PM summary, and QR actions instead of the earlier QR-only panel
- Residual gap:
  - no device or simulator validation has been run yet for the new in-app map picker or the external Street View launch path
  - mobile still does not auto-generate a fallback Street View image when no manual image is uploaded, because the current mobile environment has no reliable keyless capture path for that workflow

## Mobile Web Bundling Recovery Verification Performed
- Mobile web export:
  - `npx expo export --platform web`
  - result: passed twice after the vendor patch, and the earlier `Unable to resolve "./components/ImageItem/ImageItem"` error from `react-native-image-viewing` no longer appears
- Patch persistence:
  - `npx patch-package react-native-image-viewing`
  - result: passed and created `mobile/patches/react-native-image-viewing+0.2.2.patch`

## Mobile Web Bundling Recovery Notes
- Root cause:
  - `react-native-image-viewing@0.2.2` imported `./components/ImageItem/ImageItem` from `dist/ImageViewing.js`, but the published package only shipped `ImageItem.android.js` and `ImageItem.ios.js`, with no generic or web entry file.
  - Expo web therefore had no valid module target to resolve during bundling, even though Android and iOS could still pick their platform files.
- Fix:
  - added a tiny vendor shim file `ImageItem.web.js` plus matching type stub that re-exports the existing iOS implementation for web
  - captured that vendor edit in `patch-package` so future installs reapply the fix automatically
- Residual gap:
  - manual QA is still needed for the actual image zoom interaction on web and native in the `Tasks` screen, because this pass only verified bundle recovery, not gesture behavior

## Mobile Google Maps Activation Verification Performed
- Mobile formatting:
  - `npx prettier --write screens/locations/TrafficLightLocationMapPicker.tsx screens/locations/TrafficLightStreetViewPreview.tsx screens/locations/TrafficLightLocationForm.tsx app.config.ts config.ts`
  - result: passed
- Mobile web export:
  - `npx expo export --platform web`
  - result: passed after the mobile picker switched to the Google Maps-capable `WebView` path
- Mobile typecheck:
  - `npx tsc --noEmit`
  - result: still fails only because of the pre-existing `expo-file-system` typing issue in `mobile/screens/workOrders/WODetailsScreen.tsx`
- Expo runtime config inspection:
  - `npx expo config --type public`
  - result: passed and confirmed the current local environment still has `extra.GOOGLE_KEY = undefined`, so the new Google picker branch will stay on the OpenStreetMap fallback until a real key is provided to the mobile runtime

## Mobile Google Maps Activation Notes
- Root cause:
  - the accepted web traffic-light flow already relies on Google Maps JS plus interactive Street View, but the mobile parity pass had intentionally stopped at a keyless `Leaflet + OpenStreetMap + Nominatim` picker because there was no reliable Google key path in the mobile runtime at that time.
  - once the operator explicitly provided a Google key, the mobile map became the most visible remaining UX mismatch between web and mobile create or edit flows.
- Fix:
  - upgraded the mobile picker `WebView` to prefer Google Maps JS for in-form map rendering, search, pin placement, drag-to-adjust, and reverse geocoding whenever `GOOGLE_KEY` is present
  - added a dedicated inline Street View preview panel so operators can inspect the selected intersection and pole inside the mobile form, similar to the web workflow
  - exposed `GOOGLE_KEY` through Expo `extra` and updated mobile config so the picker can read the key from runtime config as well as inline environment variables
  - kept the original OpenStreetMap implementation as a fallback when no key is configured, to avoid breaking the existing mobile create or edit flow in local environments
- Residual gap:
  - the current local environment still has no `GOOGLE_KEY` set, so manual device QA of the Google branch still requires exporting the key, restarting the Expo dev server, and reopening the app
  - manual mobile QA is still needed to confirm how the Google Maps JS key restrictions behave inside the mobile `WebView`, because browser-referrer-restricted keys may not authorize the in-app picker even if they already work for the desktop web frontend

## Web Location Image Recovery Verification Performed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/LocationDetails.tsx src/content/own/Locations/index.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/LocationDetails.tsx src/content/own/Locations/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Location Image Recovery Notes
- Root cause:
  - the web traffic-light location detail tab still passed `location.image.url` into the pole detail panel, even though the dedicated traffic-light detail endpoint already returned `point.locationImageUrl`.
  - that meant the web detail screen and traffic-light edit preview could miss the pole image when the broader location payload had no image URL yet or when its earlier signed URL had gone stale, while the dedicated detail DTO already held a fresh signed URL.
- Fix:
  - updated the web traffic-light location detail tab to prefer `trafficLightDetails.point.locationImageUrl` and fall back to `location.image.url` only if the newer DTO field is absent
  - updated the traffic-light edit modal preview to use the same fresh signed image source so detail view and edit view stay aligned
- Residual gap:
  - manual browser QA is still needed against a location that actually has a stored image, because this pass verified the data wiring and build health rather than exercising the live UI end to end

## Local MinIO Image Runtime Recovery Verification Performed
- Database image inspection:
  - queried the live PostgreSQL instance on `127.0.0.1:5434/atlas` via JDBC
  - result: location `test07` exists as `location.id = 152`, with `image_id = 52` and file path `company 2/517cc164-4a29-49c8-9dbc-b622d41ea518 test07-street-view.jpg`
- MinIO object inspection:
  - fetched the `test07` object directly with the MinIO Java client using bucket `atlas-bucket`
  - result: object exists and begins with valid JPEG bytes (`FFD8FFE0...JFIF`)
- Presigned URL comparison:
  - generated a presigned URL for the same object against `http://localhost:9000`
  - result: `curl` on Windows reproduced `Recv failure: Connection was reset`
  - generated a presigned URL for the same object against `http://127.0.0.1:9000`
  - result: `curl` download succeeded and returned `Content-Type: image/jpeg` with the expected file size
- Live backend runtime:
  - updated local tracked config to use `PUBLIC_MINIO_ENDPOINT=http://127.0.0.1:9000`
  - restarted the Spring Boot backend on `localhost:8080` with the corrected MinIO endpoint
  - result: backend started successfully and Liquibase reported the database up to date

## Local MinIO Image Runtime Recovery Notes
- Root cause:
  - after the frontend switched to the fresh traffic-light image field, image rows such as `test07` still rendered as broken in the browser because the actual presigned URL host coming from local backend config was `http://localhost:9000`.
  - on this Windows and Docker local setup, standard browser-style HTTP clients reproduced connection resets for those `localhost:9000` signed URLs, even though the image object still existed and MinIO itself was healthy.
- Fix:
  - changed the tracked local development `PUBLIC_MINIO_ENDPOINT` defaults in `.env`, `.env.example`, and `docker-compose.yml` from `http://localhost:9000` to `http://127.0.0.1:9000`
  - restarted the live backend with `PUBLIC_MINIO_ENDPOINT` and `MINIO_ENDPOINT` both pointing at `127.0.0.1:9000` so newly signed image URLs use the working host
- Residual gap:
  - browser QA is still needed after a hard reload because any already-open page may still hold older `localhost:9000` image URLs in memory until the location detail is re-fetched

## Web Street View To Map Sync Verification Performed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/components/form/SelectMapCoordinates.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/components/form/SelectMapCoordinates.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Street View To Map Sync Notes
- Root cause:
  - the web traffic-light form let the selected map point drive the Street View panorama, but once the operator used Street View navigation to move farther down the road, the form coordinates and map marker stayed at the original point.
  - the first fix wrote the moving panorama position back into the saved form coordinates, which solved the visual sync loop but exposed a semantic problem during QA: Google Street View moves the camera between roadway panoramas, so `getPosition()` is not the same thing as the selected traffic-light pole position.
- Fix:
  - kept the selected map point as the canonical traffic-light coordinates and stopped writing Street View road movement back into `formik.values.coordinates`
  - continued tracking the current Street View camera location inside `streetViewCapture.position`, and surfaced that separate position back on the map as a blue camera marker with a connector line to the fixed red pole marker
  - added a selected-point marker overlay inside the Street View panorama so the operator can keep visual context on the pole while moving the camera along nearby road segments
  - added a lightweight `streetViewCapture` state so the existing fallback-image generator now uses the operator's current panorama position, heading, pitch, and zoom instead of the initial Street View defaults
- Residual gap:
  - manual browser QA is still needed to confirm how smooth the dual-marker behavior feels in practice when operators take multiple consecutive road steps or pan around before moving again

## Web Location Modal White-Screen Recovery Verification Performed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/Locations/index.tsx src/content/own/components/form/SelectMapCoordinates.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`
- Standalone render harness:
  - mounted `TrafficLightLocationCreateForm` under the real project `ThemeProviderWrapper` plus `SnackbarProvider` in a local `jsdom` harness
  - result before the fix: reproduced `Maximum update depth exceeded` from `StreetViewPreview -> onCaptureChange -> formik.setFieldValue(...)`
  - result after the fix: render completed successfully and the harness exited cleanly

## Web Location Modal White-Screen Recovery Notes
- Root cause:
  - `StreetViewPreview` depended directly on callback props such as `onCaptureChange`, `onCoordinatesChange`, and `onAddressResolve`, while the parent Formik form recreated those callback closures every render.
  - the mount-time `!coordinates` path in `StreetViewPreview` called `onCaptureChange(null)`, which wrote back into Formik, changed the callback identity, reran the effect, and looped until React aborted with `Maximum update depth exceeded`, leaving the modal blank.
- Fix:
  - introduced callback refs inside `StreetViewPreview` so the effect reads the latest Formik writers without depending on their render-to-render identity
  - replaced direct callback invocations inside the panorama effect and event listeners with those refs, then narrowed the effect dependencies back to the actual Street View inputs
- Residual gap:
  - manual browser QA is still needed to confirm the recovered modal behaves correctly under the live Google Maps script and not only in the render harness and production build

## Web Street View Google-Style Marker Sync Verification Performed
- Frontend formatting:
  - `npx prettier --write src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/components/form/SelectMapCoordinates.tsx src/content/own/components/Map/index.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/content/own/components/form/SelectMapCoordinates.tsx src/content/own/components/Map/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Street View Google-Style Marker Sync Notes
- Root cause:
  - the previous correction surfaced Street View movement as a separate blue camera marker with a connector to the fixed red point, but operator QA wanted the red selected marker itself to behave like Google Maps' Street View position marker.
- Fix:
  - removed the separate Street View camera marker and connector from the shared web map picker
  - synchronized `StreetViewPanorama.getPosition()` back into the form coordinates so the selected red marker and popup coordinates move with the live panorama position
  - passed the current Street View heading into the map picker and rendered the selected marker with a directional cone so the marker orientation follows the operator's view
  - ignored stale reverse-geocode and place-details callbacks once Street View has already moved the current selection, preventing older map-click results from overwriting the popup coordinates
  - kept the existing skip-reload guard and preserved map zoom while panning to Street View-driven coordinate updates
- Residual gap:
  - manual browser QA is still needed with the live Google Maps script to confirm the marker heading visually matches Street View during repeated arrow navigation, pan, and zoom interactions

## Web Map Picker Persistent Address Panel Verification Performed
- Frontend formatting:
  - `npx prettier --write src/content/own/components/Map/index.tsx`
  - result: passed
- Frontend targeted lint:
  - `npx eslint src/content/own/components/Map/index.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Map Picker Persistent Address Panel Notes
- Root cause:
  - after the selected marker began following Street View, the map-click reverse-geocode callback could be ignored as stale once Street View snapped the selected coordinate to the active panorama location.
  - the old closeable `InfoWindow` also let operators lose the `OK` action used to write the resolved address into the form.
- Fix:
  - re-run reverse geocoding when the controlled selected coordinate changes and the current preview belongs to an older coordinate
  - keep stale geocode and place-details guards so old async callbacks do not overwrite the active Street View coordinate
  - replace the select-mode `InfoWindow` with a persistent lower-left map panel that shows title or address, coordinates, heading, optional Google Maps link, and the `OK` address-confirm action
  - keep the panel visible after `OK` so operators can continue moving in Street View and confirm the latest resolved address without clicking the map again
- Residual gap:
  - manual browser QA is still needed with the live Google Maps script to confirm the lower-left panel placement does not cover important controls on small modal widths

## Unlimited Location Quota And Delete Recovery Verification Performed
- Backend focused test:
  - `.\mvnw.cmd -Dtest=LocationServiceTest test`
  - result: passed, 4 tests run
- Diff whitespace check:
  - `git diff --check -- api/src/main/java/com/grash/service/LocationService.java api/src/main/java/com/grash/service/TrafficLightPointService.java api/src/main/java/com/grash/repository/QrTagRepository.java api/src/test/java/com/grash/service/LocationServiceTest.java api/src/main/resources/db/master.xml api/src/main/resources/db/changelog/2026_04_28_1777370000_traffic_light_delete_cascade.xml`
  - result: passed, with only the repository's normal LF-to-CRLF warnings on Windows

## Unlimited Location Quota And Delete Recovery Notes
- Root cause:
  - `LocationService.create(...)` and `importLocation(...)` called the inherited usage-based license guard for `UNLIMITED_LOCATIONS`.
  - `Consts.usageBasedLicenseLimits` set the non-licensed location threshold to 10, which blocked adding the 11th location.
  - traffic-light locations also have extension rows in `traffic_light_point` and `qr_tag`; the original traffic-light migration did not set those foreign keys to cascade, so deleting a location could be blocked by those references.
- Fix:
  - removed the location quota check from manual create and import flows
  - added a `TrafficLightPointService.deletePointForLocation(...)` cleanup path that deletes QR tags and the traffic-light point before deleting the location
  - added `2026_04_28_1777370000_traffic_light_delete_cascade.xml` to migrate the QR and traffic-light point foreign keys to `ON DELETE CASCADE`
- Residual gap:
  - the running backend must be restarted so Liquibase applies the new cascade migration before live browser QA

## Web Location Mutation Refresh And Street View Edit Image Verification Performed
- Backend focused test:
  - `.\mvnw.cmd -Dtest=LocationServiceTest test`
  - result: passed, 5 tests run
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/slices/location.ts`
  - result: passed
- Diff whitespace check:
  - `git diff --check -- frontend/src/content/own/Locations/index.tsx frontend/src/slices/location.ts api/src/main/java/com/grash/service/LocationService.java api/src/test/java/com/grash/service/LocationServiceTest.java`
  - result: passed, with only the repository's normal LF-to-CRLF warnings on Windows
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Location Mutation Refresh And Street View Edit Image Notes
- Root cause:
  - delete and edit mutations updated the flat `locations` state, while the visible web table is usually driven by `locationsHierarchy`, leaving deleted or edited rows stale until a manual refresh.
  - traffic-light edit suppressed generated Street View image replacement whenever the location already had an image, so changing the Street View framing during edit could not update the saved pole image.
- Fix:
  - updated the location Redux reducers to keep flat, hierarchy, and mini location state aligned after add, edit, and delete
  - refreshed loaded location views and traffic-light map data after create, edit, and delete
  - changed traffic-light edit to submit a generated Street View image whenever no manual image is uploaded and coordinates are available
  - changed backend generated-image handling so create still only fills a missing image, while edit can replace the existing image when a generated image payload is present
- Residual gap:
  - manual browser QA is still needed against the live backend to confirm the row disappears immediately after delete and the refreshed signed image URL changes after editing Street View.

## Web Street View Edit Image Fetch Recovery Verification Performed
- Backend focused test:
  - `.\mvnw.cmd -Dtest=LocationServiceTest test`
  - result: passed, 5 tests run
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/content/own/Locations/TrafficLightLocationCreateForm.tsx src/slices/location.ts`
  - result: passed
- Diff whitespace check:
  - `git diff --check -- api/src/main/java/com/grash/dto/LocationPatchDTO.java api/src/main/java/com/grash/service/LocationService.java frontend/src/content/own/Locations/index.tsx frontend/src/content/own/Locations/TrafficLightLocationCreateForm.tsx`
  - result: passed, with only the repository's normal LF-to-CRLF warnings on Windows
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Street View Edit Image Fetch Recovery Notes
- Root cause:
  - the traffic-light create/edit form tried to `fetch()` the Google Street View Static image in the browser so it could convert the response into base64 before sending the location update.
  - Google image endpoints can render in Maps or an image context while still rejecting JavaScript fetch because of browser CORS or network policy, so the update could save the location but never send usable generated image bytes.
  - the post-save forced traffic-light map refresh could also surface a secondary `Failed to fetch` snackbar after a successful list edit, which made the successful save look partially failed.
- Fix:
  - changed the generated image payload to include `generatedImageSourceUrl` instead of requiring browser-created base64
  - added backend support to download the Google Street View Static image directly, validate that the response is an image, and store it as the location image
  - restricted backend generated-image downloads to URLs beginning with the Google Street View Static endpoint
  - changed create/edit/delete list refreshes so they update the location list but only refresh the traffic-light map when the operator is actually on that map or it has already been loaded
  - prevented the traffic-light create/edit form from continuing to a false success state when the operator selected a manual image but the image upload returned no uploaded image
- Residual gap:
  - the running backend must be restarted so it can accept `generatedImageSourceUrl` and download the image server-side.
  - if the Google Cloud key blocks the Street View Static API for backend-style requests even with the configured frontend referrer, the image replacement may still need API-key restriction adjustments.

## Local MinIO Signed URL Runtime Hardening Verification Performed
- Database inspection:
  - queried the active PostgreSQL instance on `localhost:5434`
  - result: latest traffic-light locations such as ids `252`, `207`, `206`, `205`, `204`, `203`, `202`, `152`, `102`, and `52` have non-null `image_id` values and file paths
- MinIO object inspection:
  - inspected the local `atlas_minio` container bucket
  - result: matching Street View image objects exist under `atlas-bucket/company 2`
- Live API reproduction:
  - called `GET http://127.0.0.1:8080/traffic-light-qr/TLQR-C2-P252-V1-257F84E4`
  - result before fix: `point.locationImageUrl` used `http://localhost:9000/...`, and loading that URL failed with a local connection reset
- Backend compile:
  - `.\mvnw.cmd -DskipTests compile`
  - result: passed with existing Lombok and deprecation warnings
- Live backend restart:
  - restarted Spring Boot on `localhost:8080` with DB `localhost:5434/atlas` and MinIO public endpoint `http://127.0.0.1:9000`
  - result: application started successfully
- Live API verification:
  - called `GET http://127.0.0.1:8080/traffic-light-qr/TLQR-C2-P252-V1-257F84E4`
  - result after fix: `point.locationImageUrl` uses `http://127.0.0.1:9000/...`
- Image download verification:
  - downloaded the returned signed image URL
  - result: `200 image/jpeg`, `43092` bytes

## Local MinIO Signed URL Runtime Hardening Notes
- Root cause:
  - the source code and `.env` had been adjusted toward `127.0.0.1`, but the live backend could still inherit a stale `PUBLIC_MINIO_ENDPOINT=http://localhost:9000` from the terminal environment.
  - because MinIO presigned URLs include the `host` header in the signature, simply replacing the host in the browser URL is not safe; the backend must sign using the browser-reachable host from the beginning.
- Fix:
  - `MinioService` now normalizes a local public endpoint whose host is `localhost` to `127.0.0.1` before constructing the MinIO client and signing URLs
  - the live backend was restarted after compile so newly issued signed URLs use the corrected host
- Residual gap:
  - browser tabs that already cached a detail DTO with a `localhost:9000` URL need a hard refresh or reopening of the location drawer to request a fresh signed URL.

## Web Detail Drawer Refresh After Edit Verification Performed
- Frontend targeted lint:
  - `npx eslint src/content/own/Locations/index.tsx src/content/own/Locations/LocationDetails.tsx`
  - result: passed
- Frontend build:
  - `npm run build`
  - result: passed with the same pre-existing warnings about the missing `stylis-plugin-rtl` source map and `babel-preset-react-app`

## Web Detail Drawer Refresh After Edit Notes
- Root cause:
  - after a traffic-light location edit completed, the parent screen fetched the refreshed `Location`, but the already-mounted `LocationDetails` component only refetched `traffic-light-points/location/{id}` when the location id or traffic-light flag changed.
  - editing an existing location keeps the same id and flag, so the drawer kept the old `trafficLightDetails.point.locationImageUrl` until the drawer was closed and reopened.
- Fix:
  - added a parent-owned `locationDetailsRefreshKey`
  - incremented the key after successful traffic-light and generic location edit saves
  - included the key in the `LocationDetails` traffic-light detail effect dependency list so the open drawer refetches the current point detail immediately after save
- Residual gap:
  - manual browser QA is still needed to confirm the image visually swaps immediately after saving a new Street View framing in the edit modal.
