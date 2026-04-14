# Data Model

## Phase
- Phase 1 business model alignment output.

## Current Atlas Model Relevant To Traffic Lights

### Location
- Current role in Atlas:
  - mapable place with `name`, `address`, `latitude`, `longitude`, hierarchy, teams, workers, files
- Current fit:
  - strong fit for one traffic light pole or intersection point
- Operational flag:
  - `trafficLightEnabled`
  - purpose: marks that the location should auto-provision point-centric traffic-light records
  - note: this is a workflow marker only, not a replacement for `TrafficLightPoint`

### Asset
- Current role in Atlas:
  - equipment attached to a location
- Current fit:
  - strong fit for physical devices attached to the point such as controller, lamp assembly, cabinet, sensor, battery backup

### Request
- Current role in Atlas:
  - issue intake based on `WorkOrderBase`
- Current fit:
  - strong fit for QR-submitted incident or repair request

### WorkOrder
- Current role in Atlas:
  - executable task with lifecycle and assignees
- Current fit:
  - strong fit for approved repair work

### PreventiveMaintenance
- Current role in Atlas:
  - planned work definition with schedule
- Current fit:
  - strong fit for recurring traffic light inspection or servicing

## Finalized Business Mapping

### TrafficLightPoint
- Recommended Atlas anchor:
  - `Location`
- Reason:
  - already has map coordinates and place-level identity
  - already participates in requests, work orders, and PM through `WorkOrderBase.location`
  - semantically better fit than using `Asset` as the primary field object
- Final decision:
  - use a dedicated `TrafficLightPoint` extension entity linked one-to-one to `Location`
  - keep `Location` as the canonical source for name, address, latitude, and longitude

### Main Equipment
- Recommended Atlas anchor:
  - `Asset`
- Reason:
  - lets us model hardware at the point without losing the location-first operating model
- Final decision:
  - `TrafficLightPoint.mainAsset` points to the primary `Asset` for the pole when applicable

### QR Label
- Recommended Atlas anchor:
  - new dedicated traffic-light table or tables
- Reason:
  - current asset barcode support is authenticated, asset-centric, and not public
  - QR is an access mechanism and lifecycle object, not the core business object
- Final decision:
  - use a dedicated `QrTag` entity
  - allow tag replacement history by linking multiple tags over time to one `TrafficLightPoint`

## Finalized MVP Model

### TrafficLightPoint
- Persisted fields:
  - `id`
  - `atlasLocationId`
  - `poleCode`
  - `district`
  - `ward`
  - `roadName`
  - `intersectionName`
  - `mainAssetId`
  - `trafficLightType`
  - `controllerType`
  - `installationDate`
  - `maintenanceCycleDays`
  - `isActive`
- Canonical fields kept on `Location`:
  - `name`
  - `address`
  - `latitude`
  - `longitude`
- Derived read-model fields for DTOs and services:
  - `lastInspectionAt`
  - `lastMaintenanceAt`
  - `nextMaintenanceAt`
  - `currentStatus`
- Rationale:
  - avoids duplicating mutable location data
  - avoids stale persisted status and maintenance summary columns
  - keeps derived operational state traceable to PM, request, and work order records

### QrTag
- Persisted fields:
  - `id`
  - `trafficLightPointId`
  - `qrPublicCode`
  - `status`
  - `version`
  - `printedAt`
  - `installedAt`
  - `deactivatedAt`
  - `notes`
- Notes:
  - `qrPublicCode` should be the external public lookup key
  - only one active QR tag should resolve for a point at a time
  - current default generation rule:
    - `TLQR-C{companyId}-P{pointId}-V{version}-{random8}`

### Request
- Reuse existing entity
- Final extension fields for traffic-light flow:
  - `requestSource`
  - `qrTagId`
  - `poleCode`
  - `faultType`
  - `scanTimestamp`
  - `scanLatitude`
  - `scanLongitude`
  - `safetySeverity`
- Existing Atlas fields reused directly:
  - `location`
  - `asset`
  - `title`
  - `description`
  - `priority`
  - `contact`
  - `files`
  - `image`

## Entity Mapping Table

| Business concept | Atlas anchor | Persistence decision | Notes |
| --- | --- | --- | --- |
| TrafficLightPoint identity | `Location` + `TrafficLightPoint` | thin extension entity | `Location` remains canonical place object |
| Pole code | `TrafficLightPoint.poleCode` | persisted | indexed, company-scoped unique |
| Point name | `Location.name` | persisted on existing entity | surfaced through traffic-light DTO |
| Point address | `Location.address` | persisted on existing entity | surfaced through traffic-light DTO |
| Point coordinates | `Location.latitude/longitude` | persisted on existing entity | surfaced through traffic-light DTO |
| Main equipment | `Asset` | existing entity reuse | linked as `TrafficLightPoint.mainAsset` |
| QR label | `QrTag` | new entity | public lookup lifecycle |
| Request intake | `Request` | existing entity + metadata columns | location and asset remain native request links |
| Work execution | `WorkOrder` | existing entity reuse | created through existing approval flow |
| Planned maintenance | `PreventiveMaintenance` | existing entity reuse | tied to point via `location` and optional main asset |
| Traffic-light workflow marker | `Location.trafficLightEnabled` | additive boolean on existing entity | triggers auto-provision only |

## Field-Level Mapping

| Target field | Implementation |
| --- | --- |
| `TrafficLightPoint.id` | `TrafficLightPoint.id` |
| `atlasLocationId` | `TrafficLightPoint.location.id` |
| `poleCode` | `TrafficLightPoint.poleCode` |
| `name` | `Location.name` |
| `address` | `Location.address` |
| `latitude` | `Location.latitude` |
| `longitude` | `Location.longitude` |
| `district` | `TrafficLightPoint.district` |
| `ward` | `TrafficLightPoint.ward` |
| `roadName` | `TrafficLightPoint.roadName` |
| `intersectionName` | `TrafficLightPoint.intersectionName` |
| `mainAssetId` | `TrafficLightPoint.mainAsset.id` |
| `trafficLightType` | `TrafficLightPoint.trafficLightType` |
| `controllerType` | `TrafficLightPoint.controllerType` |
| `installationDate` | `TrafficLightPoint.installationDate` |
| `maintenanceCycleDays` | `TrafficLightPoint.maintenanceCycleDays` |
| `lastInspectionAt` | derived from point-related PM/work order history |
| `lastMaintenanceAt` | derived from completed maintenance work orders for point or main asset |
| `nextMaintenanceAt` | derived from PM schedule if present, fallback to cycle rule if needed |
| `currentStatus` | derived server-side |
| `isActive` | `TrafficLightPoint.isActive` |
| `trafficLightEnabled` | `Location.trafficLightEnabled` |

## Status Model

### Current Code Statuses
- `AssetStatus`
- `WorkOrder.status`
- Request state derived from `cancelled` and `workOrder`

### Traffic Light Status Recommendation
- Derived point status preferred over duplicated manual state.
- Recommended derived statuses:
  - `HEALTHY`
  - `MAINTENANCE_DUE_SOON`
  - `MAINTENANCE_OVERDUE`
  - `NEEDS_REPAIR`
  - `IN_PROGRESS`
  - `INACTIVE`

### Suggested Derivation Inputs
- active unresolved requests at the point
- active non-complete work orders at the point
- PM schedule next due information
- last completed maintenance work order
- point active flag

## Finalized Status Derivation Rules

### Rule Order
1. `INACTIVE`
   - when `TrafficLightPoint.isActive == false`
2. `IN_PROGRESS`
   - when there is any non-complete work order for the point location
3. `NEEDS_REPAIR`
   - when there is any pending non-cancelled request for the point
   - or when there is an open reactive work order linked to the point
4. `MAINTENANCE_OVERDUE`
   - when `nextMaintenanceAt` exists and is before now
5. `MAINTENANCE_DUE_SOON`
   - when `nextMaintenanceAt` exists and falls within the due-soon window
6. `HEALTHY`
   - otherwise

### Due-Soon Window
- MVP rule:
  - `min(7 days, max(1 day, maintenanceCycleDays * 0.2))`
- Rationale:
  - gives a stable default without adding another configuration surface in the first implementation

## Minimal Schema Change Proposal

### New Tables
- `traffic_light_point`
- `qr_tag`

### Request Table Changes
- add `request_source`
- add `qr_tag_id`
- add `pole_code`
- add `fault_type`
- add `scan_timestamp`
- add `scan_latitude`
- add `scan_longitude`
- add `safety_severity`

### Indexes
- `traffic_light_point.atlas_location_id`
- `traffic_light_point.pole_code`
- `traffic_light_point.is_active`
- `traffic_light_point.main_asset_id`
- `qr_tag.qr_public_code`
- `qr_tag.traffic_light_point_id`
- `qr_tag.status`
- `request.qr_tag_id`
- `request.pole_code`
- `request.request_source`

## Phase 2 Implemented Schema Notes

### Implemented Tables
- `traffic_light_point`
- `qr_tag`

### Implemented Request Columns
- `request_source`
- `qr_tag_id`
- `pole_code`
- `fault_type`
- `scan_timestamp`
- `scan_latitude`
- `scan_longitude`
- `safety_severity`

### Implemented Liquibase Behavior
- existing null `request_source` rows are backfilled to `MANUAL`
- indexes for QR lookup and pole lookup are included in the first migration
- the migration is additive and does not rewrite existing request, work order, or PM flows

## Phase 5 Read Model Notes

### TrafficLightMapPointDTO
- Purpose:
  - internal operational map summary DTO
- Fields:
  - `id`
  - `atlasLocationId`
  - `poleCode`
  - `name`
  - `address`
  - `latitude`
  - `longitude`
  - `district`
  - `ward`
  - `currentStatus`
  - `lastMaintenanceAt`
  - `nextMaintenanceAt`
- Notes:
  - this is a read-model only surface for the internal traffic-light map
  - Phase 5 did not introduce any new persisted entities or schema changes
  - map status continues to come from the same server-side derivation rules already defined for `TrafficLightPointPublicDTO`

## Phase 6 Read Model Notes

### TrafficLightPointDetailDTO
- Purpose:
  - internal point-detail DTO for the location drawer
- Fields:
  - `point`
  - `activeQrPublicCode`
  - `preventiveMaintenances`
  - `recentWorkOrders`
- Notes:
  - reuses `TrafficLightPointPublicDTO` as the point summary payload
  - remains a read-model only surface with no schema change
  - the location drawer now uses `activeQrPublicCode` to render the printable internal QR view

## Post-Phase Location Provisioning Notes

### Location Create or Enable Flow
- When `Location.trafficLightEnabled == true`:
  - `LocationService` now auto-provisions a `TrafficLightPoint` if one does not yet exist
  - the default `poleCode` is generated from `Location.customId`
  - an active `QrTag` is created automatically if the point has no active tag

### Disable Behavior
- If a location already has a `TrafficLightPoint`, attempts to turn `trafficLightEnabled` off through the update flow are ignored.
- Rationale:
  - avoids orphaning point history, QR access, PM context, and map behavior after the point already exists

### TrafficLightPreventiveMaintenanceSummaryDTO
- Purpose:
  - compact PM schedule summary for point detail
- Fields:
  - `id`
  - `name`
  - `customId`
  - `nextWorkOrderDate`
  - `schedule`
- Notes:
  - keeps point detail compact while still letting the frontend render schedule descriptions
  - avoids returning full PM detail payloads for the location drawer

## Risks And Tradeoffs

### Thin Extension Entity vs Extending `Location`
- Chosen:
  - thin `TrafficLightPoint` extension entity
- Benefits:
  - avoids bloating generic Atlas `Location`
  - isolates traffic-light-specific behavior
  - easier to roll out and reason about
- Cost:
  - one extra join in point queries

### Derived Status vs Persisted Status
- Chosen:
  - derived status
- Benefits:
  - avoids stale duplicated state
  - keeps status explainable
- Cost:
  - requires explicit aggregation service and careful query design

### Separate `QrTag` vs Reusing Asset Barcode
- Chosen:
  - separate `QrTag`
- Benefits:
  - public-safe lookup path
  - QR lifecycle history
  - keeps asset internals separate from point access
- Cost:
  - one new entity and migration

### Request Metadata On `Request` vs Separate Detail Table
- Chosen:
  - additive nullable columns on `Request`
- Benefits:
  - simplest approval-flow reuse
  - keeps QR intake audit data next to the request record that triggered the work
- Cost:
  - `Request` grows slightly wider
