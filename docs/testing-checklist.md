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
