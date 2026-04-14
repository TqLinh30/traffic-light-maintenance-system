# Project Overview

## Project
- Traffic light maintenance management customization on top of the existing Atlas CMMS codebase.

## Business Goal
- Manage one real traffic light pole or point as one operational point.
- Show point health and maintenance state on a map.
- Let workers or citizens scan a QR code at a pole and submit a request quickly.
- Let admins review requests, approve or reject them, and convert approved requests into work orders.
- Reuse Atlas preventive maintenance and history capabilities instead of rebuilding them.

## Current Repository Surfaces
- Backend: Spring Boot 3.2 / Java 17 in `api/`
- Web frontend: React 17 / MUI in `frontend/`
- Mobile app: Expo React Native in `mobile/`

## What Already Exists
- Core CMMS entities already present:
  - `Location`
  - `Asset`
  - `Request`
  - `WorkOrder`
  - `PreventiveMaintenance`
- Public request intake already exists through request portals:
  - Backend public endpoint: `/requests/portal/{requestPortalUuid}`
  - Frontend public route: `/request-portal/:uuid`
- Request approval already converts a request into a work order.
- Locations already have latitude and longitude and a simple map view.
- Assets already support barcode and NFC fields plus lookup endpoints.
- Mobile already supports barcode or QR scanning for internal asset lookup.

## Key Discovery
- The codebase already has most of the workflow backbone needed for a QR MVP.
- The main missing pieces are domain-specific:
  - first-class traffic light point identity
  - QR tag resolution by public code
  - traffic-light-specific request metadata
  - derived point status
  - operational map layer centered on traffic light points instead of generic locations

## Phase 1 Outcome
- `TrafficLightPoint` is finalized as a thin extension entity over `Location`.
- `QrTag` is finalized as a dedicated public-lookup entity.
- QR request metadata is finalized as additive fields on `Request`.
- Point status and maintenance summary fields are finalized as derived read-model values rather than persisted source-of-truth columns.

## Phase 2 Outcome
- Backend QR MVP vertical slice is implemented.
- New backend entities and persistence:
  - `TrafficLightPoint`
  - `QrTag`
  - additive QR metadata on `Request`
- New public QR endpoints:
  - `GET /traffic-light-qr/{qrPublicCode}`
  - `POST /traffic-light-qr/{qrPublicCode}/requests`
- Existing request side effects were reused through a shared lifecycle service instead of duplicating notification logic.
- Point status is now derived server-side from:
  - point active flag
  - open requests
  - related work orders
  - maintenance cycle timing
- Phase 2 intentionally does not yet include:
  - frontend QR pages
  - admin traffic-light request UI
  - duplicate request throttling
  - traffic-light map overlays

## Phase 3 Outcome
- Public QR frontend flow is implemented and verified.
- New public route structure:
  - `/traffic-light/:qrPublicCode`
  - `/traffic-light/:qrPublicCode/report`
  - `/traffic-light/:qrPublicCode/success`
- The public QR page now supports:
  - landing page with point summary and derived status
  - inline point details
  - active work order context when present
  - mobile-friendly issue report form
  - success confirmation step
- Best-effort device geolocation is captured for QR submissions when the browser allows it.

## Phase 4 Outcome
- Internal request review screens now expose traffic-light request context.
- Request list now surfaces:
  - request source
  - pole code
  - location
  - fault type
  - safety severity
- Request detail drawer now surfaces:
  - request source
  - pole code
  - fault type
  - safety severity
  - scan timestamp
  - scan coordinates
- Approval and rejection actions were left on the existing request workflow path and were not refactored in this phase.

## Phase 5 Outcome
- Internal traffic-light operational map support is now implemented and verified.
- New internal backend endpoint:
  - `GET /traffic-light-points/map`
- The locations screen now includes a dedicated traffic-light map tab with:
  - status-colored point markers
  - status filter
  - district filter
  - click-through to the existing location detail surface
- The shared map component now supports:
  - per-marker color
  - optional subtitle
  - optional click-through override link

## Phase 6 Outcome
- PM and history integration is now implemented and verified.
- New internal backend detail endpoint:
  - `GET /traffic-light-points/location/{locationId}`
- Point maintenance detail now reuses:
  - PM schedules linked to the point location
  - PM schedules linked to the point main asset
  - related work-order history for the point location or main asset
- `nextMaintenanceAt` now prefers the earliest related PM next-work-order date when one exists and falls back to the maintenance-cycle rule otherwise.
- The location detail drawer now exposes a traffic-light detail tab with:
  - derived maintenance summary
  - related PM schedules
  - recent work orders

## Phase 7 Outcome
- Hardening and optimization review is now implemented and verified for the current MVP scope.
- The traffic-light map summary path now batches:
  - related work orders
  - related PM schedules
  - pending-request location ids
- Internal endpoint permission review confirmed:
  - public access remains limited to `/traffic-light-qr/**`
  - internal traffic-light point endpoints remain authenticated and location-permission-gated
- Duplicate-request handling was reviewed and intentionally left as a documented operational follow-up rather than adding automatic suppression without field evidence.

## Post-Phase Localization Outcome
- Frontend localization maintenance is now implemented and verified.
- Vietnamese is now registered as a supported frontend language with a full locale bundle in `frontend/src/i18n/translations/vi.ts`.
- Traditional Chinese now has complete key coverage against the current English locale and no longer leaves the known untranslated gaps that were falling back to English.
- Settings, public request portal, and public traffic-light QR flows now share the same lazy-loaded language-switch helper, which prevents the selected language value from drifting away from the loaded UI language.

## Reuse Strategy
- Use `Location` as the primary Atlas object for one traffic light point.
- Use `Asset` as secondary equipment attached to the point.
- Reuse `Request` for issue intake.
- Reuse `WorkOrder` for execution.
- Reuse `PreventiveMaintenance` for planned maintenance.
- Add traffic-light-specific extensions only where Atlas does not already cover the need.

## Smallest QR MVP Path
1. In Phase 1, confirm the exact `TrafficLightPoint -> Location` mapping and define the minimum extra schema.
2. Add a dedicated QR lookup mechanism instead of overloading asset barcode lookup.
3. Reuse existing request creation and approval flow.
4. Add a new mobile-friendly QR landing page rather than repurposing the generic request portal page directly.
5. Derive traffic-light status from existing request, work order, PM, and asset state where possible.

## Relevant Code Areas
- Backend controllers:
  - `api/src/main/java/com/grash/controller/LocationController.java`
  - `api/src/main/java/com/grash/controller/AssetController.java`
  - `api/src/main/java/com/grash/controller/RequestController.java`
  - `api/src/main/java/com/grash/controller/WorkOrderController.java`
  - `api/src/main/java/com/grash/controller/PreventiveMaintenanceController.java`
  - `api/src/main/java/com/grash/controller/RequestPortalController.java`
  - `api/src/main/java/com/grash/controller/TrafficLightQrController.java`
  - `api/src/main/java/com/grash/controller/TrafficLightPointController.java`
- Backend models:
  - `api/src/main/java/com/grash/model/Location.java`
  - `api/src/main/java/com/grash/model/Asset.java`
  - `api/src/main/java/com/grash/model/Request.java`
  - `api/src/main/java/com/grash/model/WorkOrder.java`
  - `api/src/main/java/com/grash/model/PreventiveMaintenance.java`
  - `api/src/main/java/com/grash/model/RequestPortal.java`
  - `api/src/main/java/com/grash/model/RequestPortalField.java`
  - `api/src/main/java/com/grash/model/TrafficLightPoint.java`
  - `api/src/main/java/com/grash/model/QrTag.java`
- Backend services and DTOs:
  - `api/src/main/java/com/grash/service/TrafficLightPointService.java`
  - `api/src/main/java/com/grash/service/RequestLifecycleService.java`
  - `api/src/main/java/com/grash/dto/trafficLight/TrafficLightQrResolveDTO.java`
  - `api/src/main/java/com/grash/dto/trafficLight/TrafficLightPointPublicDTO.java`
  - `api/src/main/java/com/grash/dto/trafficLight/TrafficLightQrRequestCreateDTO.java`
  - `api/src/main/java/com/grash/dto/trafficLight/TrafficLightMapPointDTO.java`
- Backend migrations and tests:
  - `api/src/main/resources/db/changelog/2026_04_12_1776001000_traffic_light_qr.xml`
  - `api/src/test/java/com/grash/service/TrafficLightPointServiceTest.java`
- Web frontend:
  - `frontend/src/router/index.tsx`
  - `frontend/src/router/app.tsx`
  - `frontend/src/content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage.tsx`
  - `frontend/src/content/own/Settings/General/index.tsx`
  - `frontend/src/content/own/Settings/RequestPortal/PublicPage/RequestPortalPublicPage.tsx`
  - `frontend/src/contexts/JWTAuthContext.tsx`
  - `frontend/src/i18n/i18n.ts`
  - `frontend/src/i18n/translations/vi.ts`
  - `frontend/src/i18n/translations/zh_tw.ts`
  - `frontend/src/models/owns/trafficLight.ts`
  - `frontend/src/content/own/Requests/`
  - `frontend/src/content/own/Locations/`
  - `frontend/src/content/own/WorkOrders/`
  - `frontend/src/content/own/Settings/RequestPortal/PublicPage/RequestPortalPublicPage.tsx`
  - `frontend/src/content/own/components/Map/index.tsx`
- Mobile:
  - `mobile/screens/ScanAssetScreen.tsx`
  - `mobile/screens/modals/SelectBarcodeModal.tsx`
  - `mobile/slices/asset.ts`

## Probable Gaps
- No dedicated traffic-light point detail page exists yet in the web app.
- Duplicate-request protection is not yet implemented for QR submissions.
- No controller-level frontend integration tests exist for the public QR flow.
- Large-data traffic-light map optimization is not implemented yet.
- No automated UI coverage yet exists for the traffic-light location-detail tab.
- Non-traffic-light location details still perform one optional traffic-light lookup before hiding the tab.

## Phase 0 Outcome
- Repository discovery complete enough to begin Phase 1 business model alignment with low risk.

## Phase 1 Outcome
- Business model alignment complete enough to implement minimal backend QR support.

## Current Status
- Phase 0: completed
- Phase 1: completed
- Phase 2: completed
- Phase 3: completed
- Phase 4: completed
- Phase 5: completed
- Phase 6: completed
- Phase 7: completed
- Post-phase localization maintenance: completed
- Next smallest logical step:
  - run manual UAT for traffic-light workflows and localization switching, then decide deployment or pilot rollout sequencing
