# System Architecture

## Current Goal
- Document the existing architecture relevant to the traffic light maintenance customization.

## Backend Architecture
- Framework: Spring Boot with layered packages under `api/src/main/java/com/grash/`
- Main layers:
  - `controller/`
  - `service/`
  - `repository/`
  - `model/`
  - `dto/`
  - `mapper/`

## Backend Domain Modules Relevant To This Project

### Locations
- Model: `model/Location.java`
- Controller: `controller/LocationController.java`
- Service: `service/LocationService.java`
- Repository: `repository/LocationRepository.java`
- DTOs: `dto/LocationShowDTO.java`, `dto/LocationPatchDTO.java`, `dto/LocationMiniDTO.java`
- Notes:
  - Stores `name`, `address`, `latitude`, `longitude`, hierarchy, workers, teams, vendors, customers, files.
  - Already suitable as the primary map anchor for a traffic light point.

### Assets
- Model: `model/Asset.java`
- Controller: `controller/AssetController.java`
- Service: `service/AssetService.java`
- Repository: `repository/AssetRepository.java`
- DTOs: `dto/AssetShowDTO.java`, `dto/AssetPatchDTO.java`, `dto/AssetMiniDTO.java`
- Notes:
  - Already linked to `Location`.
  - Has `barCode`, `nfcId`, `status`, equipment metadata, and downtime logic.
  - Good fit for controller cabinets, lamps, sensors, or secondary hardware, but not ideal as the primary pole identity.

### Requests
- Model: `model/Request.java`
- Controller: `controller/RequestController.java`
- Service: `service/RequestService.java`
- Repository: `repository/RequestRepository.java`
- DTOs: `dto/RequestShowDTO.java`, `dto/RequestPatchDTO.java`, `dto/RequestApproveDTO.java`
- Notes:
  - Extends `WorkOrderBase`.
  - Already supports `location`, `asset`, `priority`, attachments, contact, and portal origin.
  - Approval path already exists and creates a work order.
  - Rejection path already exists and sets `cancelled` plus `cancellationReason`.

### Work Orders
- Model: `model/WorkOrder.java`
- Controller: `controller/WorkOrderController.java`
- Service: `service/WorkOrderService.java`
- Repository: `repository/WorkOrderRepository.java`
- DTOs: `dto/workOrder/WorkOrderShowDTO.java`, `dto/workOrder/WorkOrderPostDTO.java`, `dto/workOrder/WorkOrderPatchDTO.java`
- Notes:
  - Extends `WorkOrderBase`.
  - Tracks execution status through `Status` enum (`OPEN`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETE`).
  - Can be linked to both `parentRequest` and `parentPreventiveMaintenance`.

### Preventive Maintenance
- Model: `model/PreventiveMaintenance.java`
- Controller: `controller/PreventiveMaintenanceController.java`
- Service: `service/PreventiveMaintenanceService.java`
- Repository: `repository/PreventiveMaintenanceRepository.java`
- Notes:
  - Extends `WorkOrderBase`.
  - Uses `Schedule` and Quartz scheduling.
  - Already linked to location and asset through inherited fields.

### Public Request Portal
- Model: `model/RequestPortal.java`, `model/RequestPortalField.java`
- Controller: `controller/RequestPortalController.java`
- Service: `service/RequestPortalService.java`
- Repository: `repository/RequestPortalRepository.java`
- Notes:
  - Public metadata is UUID-based.
  - Portal fields can pin a fixed location or fixed asset.
  - Current field types are `ASSET`, `LOCATION`, `DESCRIPTION`, `CONTACT`, `IMAGE`, `FILES`.
  - This is reusable for intake patterns, but it is not a dedicated QR resolution flow.

## Core Backend Flows

### Request Creation
- Internal create: `POST /requests`
- Public portal create: `POST /requests/portal/{requestPortalUuid}`
- Public portal bootstrap: `GET /request-portals/public/{uuid}`

### Request Approval
- Endpoint: `PATCH /requests/{id}/approve`
- Implementation:
  - `RequestController.approve(...)`
  - `RequestService.createWorkOrderFromRequest(...)`
  - `WorkOrderService.create(...)`
- Outcome:
  - Creates a `WorkOrder`
  - Links it back to `Request.workOrder`
  - Optionally updates related asset status

### Request Rejection
- Endpoint: `PATCH /requests/{id}/cancel?reason=...`
- Outcome:
  - Sets `cancelled = true`
  - Stores `cancellationReason`

### Asset Scan Lookup
- Barcode: `GET /assets/barcode?data=...`
- NFC: `GET /assets/nfc?nfcId=...`
- Important:
  - This is authenticated internal lookup and tied to assets, not public QR resolution for traffic light points.

### Traffic-Light QR Resolve
- Endpoint:
  - `GET /traffic-light-qr/{qrPublicCode}`
- Implementation:
  - `TrafficLightQrController.resolve(...)`
  - `TrafficLightPointService.resolveByQrPublicCode(...)`
- Outcome:
  - resolves active `QrTag`
  - loads the related `TrafficLightPoint`
  - returns a public point DTO with derived maintenance summary and status
  - returns active work orders for worker context

### Traffic-Light QR Request Create
- Endpoint:
  - `POST /traffic-light-qr/{qrPublicCode}/requests`
- Implementation:
  - `TrafficLightQrController.createRequest(...)`
  - `TrafficLightPointService.createRequestFromQr(...)`
  - `RequestService.create(...)`
  - `RequestLifecycleService.onRequestCreation(...)`
- Outcome:
  - creates a standard Atlas `Request`
  - pre-fills `location`, optional `asset`, `poleCode`, `qrTag`, and QR scan metadata
  - reuses the existing request side-effect pipeline for notifications

### Traffic-Light Internal Map Summary
- Endpoint:
  - `GET /traffic-light-points/map`
- Implementation:
  - `TrafficLightPointController.getMapPoints(...)`
  - `TrafficLightPointService.getMapPoints(...)`
  - `TrafficLightPointRepository.findByCompanyIdWithLocation(...)`
- Outcome:
  - returns an internal point-summary list with coordinates, district, and derived status
  - keeps map status derivation server-side instead of duplicating it in the frontend
  - avoids reusing the generic location payload for traffic-light operational monitoring

### Traffic-Light Internal Point Detail
- Endpoint:
  - `GET /traffic-light-points/location/{locationId}`
- Implementation:
  - `TrafficLightPointController.getByLocation(...)`
  - `TrafficLightPointService.getDetailsByLocationId(...)`
  - `PreventiveMaintenanceRepository.findByLocationIdWithSchedule(...)`
  - `PreventiveMaintenanceRepository.findByAssetIdWithSchedule(...)`
- Outcome:
  - returns point summary, related PM schedule summaries, and recent work-order history
  - keeps PM-to-point linkage additive through existing `location` and `asset` relations
  - lets the existing location drawer act as the first traffic-light point detail surface

## Web Frontend Architecture
- Router entry:
  - `frontend/src/router/index.tsx`
  - `frontend/src/router/app.tsx`
- Main internal app routes already exist for:
  - `/app/locations`
  - `/app/assets`
  - `/app/requests`
  - `/app/work-orders`
  - `/app/preventive-maintenances`
- Public route already exists for:
  - `/request-portal/:uuid`

## Frontend Localization Layer
- Core i18n setup:
  - `frontend/src/i18n/i18n.ts`
- Translation bundles:
  - lazy-loaded from `frontend/src/i18n/translations/*.ts`
- Current supported business-facing locales now include:
  - `en`
  - `zh_tw`
  - `vi`
- Notes:
  - translation bundles are loaded on demand
  - `normalizeLanguageCode(...)` reconciles stored enum values and browser-detected locale variants
  - `switchAppLanguage(...)` is now the shared language-switch path for auth bootstrap and public or settings screens

## Web Frontend Modules Relevant To This Project

### Locations UI
- Main screen: `frontend/src/content/own/Locations/index.tsx`
- Details: `frontend/src/content/own/Locations/LocationDetails.tsx`
- Notes:
  - Supports list view, generic location map view, and a dedicated traffic-light map view.
  - The traffic-light map view fetches a dedicated summary payload instead of reusing generic location data.
  - Traffic-light markers are colored by derived status and filtered by status or district.
  - Marker click opens the existing location detail drawer to preserve the location-first business model.
  - The location detail drawer now conditionally loads traffic-light point detail by location and exposes a dedicated traffic-light tab when a point exists.

### Map Component
- `frontend/src/content/own/components/Map/index.tsx`
- Notes:
  - Generic Google Maps wrapper.
  - Marker model now supports optional `subtitle`, `href`, and `markerColor`.
  - Generic location usage remains unchanged when those optional fields are omitted.
  - No clustering or viewport-driven loading exists yet.

### Requests UI
- Main screen: `frontend/src/content/own/Requests/index.tsx`
- Details: `frontend/src/content/own/Requests/RequestDetails.tsx`
- Notes:
  - Request list computes status as approved, rejected, or pending.
  - Admin detail screen already exposes approve and reject actions.
  - When approved, UI navigates directly into the created work order.
  - Phase 4 now extends the existing request payload UI instead of creating a traffic-light-specific admin module.
  - Traffic-light metadata is rendered directly from the additive `Request` fields added in Phase 2.

### Work Orders UI
- Main screen: `frontend/src/content/own/WorkOrders/index.tsx`
- Details: `frontend/src/content/own/WorkOrders/Details/WorkOrderDetails.tsx`
- Notes:
  - Supports list and calendar views.
  - Can pre-open create flow from location or asset query params.

### Public Request Portal UI
- `frontend/src/content/own/Settings/RequestPortal/PublicPage/RequestPortalPublicPage.tsx`
- Notes:
  - Already mobile-friendly enough to reuse patterns from.
  - Submits request data through the public request endpoint.
  - Can optionally collect location and asset through portal field configuration.
  - Now uses the shared i18n switch helper so lazy-loaded locale bundles stay aligned with the selected language.

### Traffic-Light Public QR UI
- Route definitions:
  - `/traffic-light/:qrPublicCode`
  - `/traffic-light/:qrPublicCode/report`
  - `/traffic-light/:qrPublicCode/success`
- Main screen:
  - `frontend/src/content/own/TrafficLightQr/PublicPage/TrafficLightQrPublicPage.tsx`
- Frontend model:
  - `frontend/src/models/owns/trafficLight.ts`
- Notes:
  - Uses the dedicated traffic-light backend endpoints rather than portal UUID endpoints.
  - Keeps public QR state local to the page instead of adding a new Redux slice.
  - Reuses the app's shared `api` utility and i18n setup.
  - Shows active work-order context read-only for worker confirmation without linking into authenticated internal screens.
  - Now uses the shared i18n switch helper for on-page language changes.

### Internal Settings UI
- Main screen:
  - `frontend/src/content/own/Settings/General/index.tsx`
- Notes:
  - Company general preferences remain the persisted source for selected language.
  - The settings select now normalizes stored language codes before rendering, which keeps legacy or variant values from showing the wrong selected label.

## Mobile Architecture
- Stack: Expo React Native app in `mobile/`
- Relevant screens:
  - `mobile/screens/ScanAssetScreen.tsx`
  - `mobile/screens/modals/SelectBarcodeModal.tsx`
  - request, work order, location, and asset detail screens
- Notes:
  - Mobile scan is currently an internal authenticated asset lookup flow.
  - It is not a public citizen QR request flow.
  - Existing scan UX is still useful for worker confirmation in later phases.

## Status Representation Today
- Asset status:
  - `Asset.status` using `AssetStatus`
- Work order execution status:
  - `WorkOrder.status` using `Status`
- Request status:
  - derived in service and UI from:
    - `cancelled`
    - `workOrder != null`
- Traffic light point status:
  - derived in `TrafficLightPointService.deriveStatus(...)`
  - values:
    - `HEALTHY`
    - `MAINTENANCE_DUE_SOON`
    - `MAINTENANCE_OVERDUE`
    - `NEEDS_REPAIR`
    - `IN_PROGRESS`
    - `INACTIVE`

## Database Change Pattern
- Liquibase master changelog:
  - `api/src/main/resources/db/master.xml`
- Changelogs are appended under:
  - `api/src/main/resources/db/changelog/`
- Phase 2 traffic-light migration:
  - `api/src/main/resources/db/changelog/2026_04_12_1776001000_traffic_light_qr.xml`

## Extension Decision
- `TrafficLightPoint` and `QrTag` will be introduced as dedicated backend entities instead of overloading:
  - `Location` with all traffic-light-specific fields
  - `Asset.barCode`
  - request portal UUID routing

## Rejected Reuse Path
- Atlas has a `CustomField` feature, but it is vendor-specific and not suitable for:
  - public QR lookup
  - point identity
  - indexed operational filtering
  - status derivation
- Atlas also has `FieldConfiguration`, but it is a UI required/optional/hidden configuration surface for work order and request forms, not a domain metadata model.

## Architecture Assessment
- Best extension seam for MVP:
  - Add traffic-light-specific persistence and service logic on the backend.
  - Reuse Atlas `Location`, `Request`, `WorkOrder`, and `PreventiveMaintenance`.
  - Add dedicated QR and status layers rather than forcing everything into existing generic portal and asset barcode patterns.
- Phase 2 assessment:
  - the backend now has a dedicated traffic-light extension seam with minimal impact on existing Atlas flows.
  - the next safe layer is a dedicated public frontend flow that consumes the new endpoints.
- Phase 3 assessment:
  - the public QR flow is now isolated from the generic request portal and can evolve independently without changing internal request screens.
  - the next safe layer is internal request review enrichment, because the backend and public request entry are both in place.
- Phase 4 assessment:
  - internal request review now sees the traffic-light context needed for triage without changing the existing approve or reject mechanics.
  - the next safe layer is the operational map, because point status, QR intake, and admin review context are now aligned.
- Phase 5 assessment:
  - the operational map now has a dedicated backend summary path and an additive frontend tab without disturbing the generic location map.
  - the next safe layer is PM and history integration, because status and dispatch visibility are now in place.
- Phase 6 assessment:
  - PM schedules and recent work orders now feed both the point detail surface and the next-maintenance derivation path.
  - the next safe layer is hardening, because the main traffic-light workflows now exist end to end.
- Phase 7 assessment:
  - the map summary path no longer does repository fan-out per point for its primary work-order, PM, and open-request signals.
  - the remaining work is operational rather than architectural: UAT, seed data, browser automation, and deployment readiness.
- Post-phase localization assessment:
  - the frontend localization layer now has one explicit switching path, complete `zh_tw` key coverage, and a first-class `vi` bundle.
  - the next safe follow-up is manual terminology QA rather than more architectural i18n change.
